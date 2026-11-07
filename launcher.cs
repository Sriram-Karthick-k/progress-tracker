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
        // An older launcher that was still running when this one was installed gets renamed to this; tidy it up.
        try { File.Delete(Path.Combine(baseDir, "InterviewPrep.old.exe")); } catch { }

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
        Console.WriteLine("  If the code changed since last time, the app updates itself first (1-2 minutes).");
        Console.WriteLine("  Notes are saved as markdown files under content\\notes\\. Progress is in your browser.");
        Console.WriteLine("  Keep this window open while you work; close it to stop the app.");
        Console.WriteLine();

        // If something already serves the port, just open the browser.
        if (PortOpen())
        {
            Open(Url);
            Console.WriteLine("  A server is already running on port " + Port + ". Opened the browser.");
            Console.WriteLine("  This window closes by itself; the app keeps running in the first window.");
            // Do NOT wait for Enter here: this copy owns no server, so it would sit idle
            // (and stay in Alt+Tab) long after the real server window was closed.
            Thread.Sleep(2500);
            return;
        }

        // Rebuild automatically when the code changed since the last build (no manual `npm run build`).
        if (!EnsureBuild(baseDir, nextBin))
        {
            Console.WriteLine("  The app cannot start without a successful build. Fix the error above, then run this again.");
            Console.WriteLine("  Press Enter to close.");
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

    // ---- automatic rebuild ------------------------------------------------------------------
    // The server runs a PRODUCTION build (.next). Whenever the code changed since that build was
    // made, rebuild before starting, so nobody has to run `npm run build` by hand. The working
    // build is kept aside while the new one is made: if the rebuild fails, the previous version
    // is restored and still starts. Notes and progress are read live and never need a rebuild.
    static readonly string[] SourceDirs = { "app", "components", "lib", "public" };
    static readonly string[] SourceFiles = { "next.config.mjs", "tailwind.config.ts", "postcss.config.mjs", "package.json" };

    // returns false only when no usable build exists at the end
    static bool EnsureBuild(string baseDir, string nextBin)
    {
        string next = Path.Combine(baseDir, ".next");
        string prev = Path.Combine(baseDir, ".next-prev");
        RecoverInterruptedBuild(next, prev);

        string buildId = Path.Combine(next, "BUILD_ID");
        string why = null;
        if (!File.Exists(buildId)) why = "there is no build yet";
        else
        {
            string newer = FirstNewerSource(baseDir, File.GetLastWriteTimeUtc(buildId));
            if (newer != null) why = newer + " changed";
        }
        if (why == null) return true; // up to date: start straight away

        Console.WriteLine("  The app code changed since the last build (" + why + ").");
        Console.WriteLine("  Updating it now, this takes about 1-2 minutes. Keep this window open.");
        Console.WriteLine();
        Console.Title = "Interview Prep Tracker - updating...";

        bool hadBuild = Directory.Exists(next);
        bool keptPrevious = false;
        if (hadBuild)
        {
            SafeDelete(prev);
            try
            {
                Directory.Move(next, prev); // the next build starts from an empty .next
                keptPrevious = true;
                string cache = Path.Combine(prev, "cache"); // keep the compile cache: makes the rebuild faster
                if (Directory.Exists(cache))
                {
                    Directory.CreateDirectory(next);
                    Directory.Move(cache, Path.Combine(next, "cache"));
                }
            }
            catch { /* locked files: build in place, there is just no fallback copy */ }
        }

        bool ok = RunBuild(baseDir, nextBin) && File.Exists(buildId);
        Console.Title = "Interview Prep Tracker";
        if (ok)
        {
            SafeDelete(prev);
            Console.WriteLine();
            Console.WriteLine("  Update finished.");
            Console.WriteLine();
            return true;
        }

        Console.WriteLine();
        Console.WriteLine("  The update FAILED (see the messages above).");
        SafeDelete(next);
        if (keptPrevious)
        {
            try
            {
                Directory.Move(prev, next);
                Console.WriteLine("  Starting the previous version instead.");
                Console.WriteLine();
                return true;
            }
            catch { }
        }
        return false;
    }

    static bool RunBuild(string baseDir, string nextBin)
    {
        var psi = new ProcessStartInfo
        {
            FileName = ResolveNode(),
            Arguments = "\"" + nextBin + "\" build",
            WorkingDirectory = baseDir,
            UseShellExecute = false,
            CreateNoWindow = false,
        };
        psi.EnvironmentVariables["NEXT_PUBLIC_NOTES_READONLY"] = "0"; // build with the Notebook editor enabled
        psi.EnvironmentVariables["NEXT_TELEMETRY_DISABLED"] = "1";
        try
        {
            using (var p = Process.Start(psi))
            {
                JobObject.AssignToKillOnClose(p); // closing this window also stops the build
                p.WaitForExit();
                return p.ExitCode == 0;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("  Could not run the build: " + ex.Message);
            return false;
        }
    }

    // The window was closed in the middle of an update: put the last working build back.
    static void RecoverInterruptedBuild(string next, string prev)
    {
        if (!Directory.Exists(prev)) return;
        if (File.Exists(Path.Combine(next, "BUILD_ID"))) { SafeDelete(prev); return; } // the new build finished
        SafeDelete(next);
        try
        {
            Directory.Move(prev, next);
            Console.WriteLine("  The last update was interrupted. Restored the previous version.");
        }
        catch { }
    }

    // first source file that is newer than the build, or null
    static string FirstNewerSource(string baseDir, DateTime builtUtc)
    {
        foreach (string f in SourceFiles)
        {
            string p = Path.Combine(baseDir, f);
            if (File.Exists(p) && File.GetLastWriteTimeUtc(p) > builtUtc) return f;
        }
        foreach (string d in SourceDirs)
        {
            string dir = Path.Combine(baseDir, d);
            if (!Directory.Exists(dir)) continue;
            foreach (string p in Directory.EnumerateFiles(dir, "*", SearchOption.AllDirectories))
                if (File.GetLastWriteTimeUtc(p) > builtUtc) return p.Substring(baseDir.Length + 1);
        }
        return null;
    }

    static void SafeDelete(string dir)
    {
        try { if (Directory.Exists(dir)) Directory.Delete(dir, true); } catch { }
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
