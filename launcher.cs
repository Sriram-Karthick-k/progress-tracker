using System;
using System.Diagnostics;
using System.IO;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Threading;

// Interview Prep Tracker launcher.
// Starts the Next.js production server (node) and opens the browser when it's ready.
class Launcher
{
    const int Port = 7373;
    static readonly string Url = "http://localhost:" + Port + "/";

    static void Main()
    {
        Console.Title = "Interview Prep Tracker";
        string baseDir = AppDomain.CurrentDomain.BaseDirectory.TrimEnd('\\');

        string nextBin = Path.Combine(baseDir, "node_modules", "next", "dist", "bin", "next");
        if (!File.Exists(nextBin))
        {
            Console.WriteLine("ERROR: this app's files are missing (node_modules\\next not found).");
            Console.WriteLine("Make sure InterviewPrep.exe stays inside the project folder.");
            Console.WriteLine("\nPress Enter to close.");
            Console.ReadLine();
            return;
        }

        Console.WriteLine();
        Console.WriteLine("  Interview Prep Tracker");
        Console.WriteLine("  ----------------------");
        Console.WriteLine("  Starting the local server, your browser will open at " + Url);
        Console.WriteLine("  Notes are saved as markdown files under content\\notes\\. Progress is in your browser.");
        Console.WriteLine("  Keep this window open while you work; close it to stop the app.");
        Console.WriteLine();

        // If something already serves the port, just open the browser.
        if (PortOpen())
        {
            Open(Url);
            Console.WriteLine("  A server is already running on port " + Port + ". Opened the browser.");
            Console.WriteLine("\n  Press Enter to close this window.");
            Console.ReadLine();
            return;
        }

        var psi = new ProcessStartInfo
        {
            FileName = ResolveNode(),
            Arguments = "\"" + nextBin + "\" start -p " + Port,
            WorkingDirectory = baseDir,
            UseShellExecute = false,
            CreateNoWindow = false,
        };
        // Keep the Notebook editor enabled at runtime (overrides .env.local).
        psi.EnvironmentVariables["NEXT_PUBLIC_NOTES_READONLY"] = "0";

        Process node;
        try { node = Process.Start(psi); }
        catch (Exception ex)
        {
            Console.WriteLine("ERROR starting Node.js: " + ex.Message);
            Console.WriteLine("Is Node.js installed and on your PATH?  https://nodejs.org");
            Console.WriteLine("\nPress Enter to close.");
            Console.ReadLine();
            return;
        }

        // Tie the server's lifetime to this window via a Job Object.
        JobObject.AssignToKillOnClose(node);

        // Kill the server if this process exits for any reason.
        AppDomain.CurrentDomain.ProcessExit += (s, e) => SafeKill(node);
        Console.CancelKeyPress += (s, e) => { SafeKill(node); };

        // Wait for the server to accept connections, then open the browser.
        for (int i = 0; i < 120 && !node.HasExited; i++)
        {
            if (PortOpen()) { Open(Url); break; }
            Thread.Sleep(500);
        }

        node.WaitForExit();
        Console.WriteLine("\nServer stopped.");
    }

    static string ResolveNode()
    {
        string def = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "nodejs", "node.exe");
        return File.Exists(def) ? def : "node";
    }

    static bool PortOpen()
    {
        try
        {
            using (var c = new TcpClient())
            {
                var ar = c.BeginConnect("127.0.0.1", Port, null, null);
                bool ok = ar.AsyncWaitHandle.WaitOne(400);
                if (ok) { c.EndConnect(ar); return true; }
                return false;
            }
        }
        catch { return false; }
    }

    static void Open(string url)
    {
        try { Process.Start(new ProcessStartInfo(url) { UseShellExecute = true }); }
        catch { Console.WriteLine("  Open this in your browser: " + url); }
    }

    static void SafeKill(Process p)
    {
        try { if (p != null && !p.HasExited) p.Kill(); } catch { }
    }
}

// Minimal Job Object wrapper: child process is terminated when this process closes.
static class JobObject
{
    [StructLayout(LayoutKind.Sequential)]
    struct JOBOBJECT_BASIC_LIMIT_INFORMATION
    {
        public long PerProcessUserTimeLimit;
        public long PerJobUserTimeLimit;
        public uint LimitFlags;
        public UIntPtr MinimumWorkingSetSize;
        public UIntPtr MaximumWorkingSetSize;
        public uint ActiveProcessLimit;
        public UIntPtr Affinity;
        public uint PriorityClass;
        public uint SchedulingClass;
    }

    [StructLayout(LayoutKind.Sequential)]
    struct IO_COUNTERS
    {
        public ulong ReadOperationCount, WriteOperationCount, OtherOperationCount;
        public ulong ReadTransferCount, WriteTransferCount, OtherTransferCount;
    }

    [StructLayout(LayoutKind.Sequential)]
    struct JOBOBJECT_EXTENDED_LIMIT_INFORMATION
    {
        public JOBOBJECT_BASIC_LIMIT_INFORMATION BasicLimitInformation;
        public IO_COUNTERS IoInfo;
        public UIntPtr ProcessMemoryLimit;
        public UIntPtr JobMemoryLimit;
        public UIntPtr PeakProcessMemoryUsed;
        public UIntPtr PeakJobMemoryUsed;
    }

    const uint JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE = 0x2000;
    const int JobObjectExtendedLimitInformation = 9;

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode)]
    static extern IntPtr CreateJobObject(IntPtr a, string name);

    [DllImport("kernel32.dll")]
    static extern bool SetInformationJobObject(IntPtr job, int infoType, IntPtr info, uint len);

    [DllImport("kernel32.dll")]
    static extern bool AssignProcessToJobObject(IntPtr job, IntPtr process);

    public static void AssignToKillOnClose(Process p)
    {
        try
        {
            IntPtr job = CreateJobObject(IntPtr.Zero, null);
            if (job == IntPtr.Zero) return;

            var ext = new JOBOBJECT_EXTENDED_LIMIT_INFORMATION();
            ext.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE;

            int len = Marshal.SizeOf(ext);
            IntPtr ptr = Marshal.AllocHGlobal(len);
            Marshal.StructureToPtr(ext, ptr, false);
            SetInformationJobObject(job, JobObjectExtendedLimitInformation, ptr, (uint)len);
            Marshal.FreeHGlobal(ptr);

            AssignProcessToJobObject(job, p.Handle);
            // Intentionally keep 'job' handle open for the lifetime of this process.
        }
        catch { }
    }
}
