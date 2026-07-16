import { LearnDomain } from "./types";
import { LLD_PROBLEM_SECTIONS } from "./lld-problems";

export const LLD: LearnDomain = {
  key: "lld",
  name: "Low-Level Design",
  tagline: "OOP → SOLID → UML → all 23 GoF patterns with Java code → 39 interview problems as design blueprints.",
  icon: "Component",
  accent: "from-sky-500 to-blue-600",
  sections: [
    /* ================= OOP FOR DESIGN ================= */
    {
      id: "oop-design",
      title: "OOP for Design",
      desc: "The four pillars and class relationships — the vocabulary of every LLD answer.",
      lessons: [
        {
          id: "four-pillars",
          title: "The four pillars",
          summary: "Encapsulation, abstraction, inheritance, polymorphism — with the design reason for each.",
          blocks: [
            {
              t: "table",
              head: ["Pillar", "One-liner", "Design payoff"],
              rows: [
                ["Encapsulation", "Hide state behind methods; expose invariants, not fields", "Objects can't be put into invalid states"],
                ["Abstraction", "Expose WHAT, hide HOW (interfaces, abstract classes)", "Callers depend on contracts, not implementations"],
                ["Inheritance", "IS-A reuse of structure + behavior", "Shared base logic — but see 'composition over inheritance'"],
                ["Polymorphism", "One call site, many behaviors (dynamic dispatch)", "New types without touching existing code"],
              ],
            },
            {
              t: "code",
              lang: "java",
              code: `class BankAccount {
  private double balance;                       // encapsulated — no setter!
  void deposit(double amt) {
    if (amt <= 0) throw new IllegalArgumentException();
    balance += amt;                             // invariant enforced HERE
  }
}
interface Notifier { void send(String msg); }   // abstraction
class Email implements Notifier { public void send(String m) { ... } }
class Sms   implements Notifier { public void send(String m) { ... } }
// polymorphism: code written against Notifier works with both — and with
// tomorrow's PushNotifier, unchanged.`,
            },
            {
              t: "note",
              md: "**Composition over inheritance:** prefer HAS-A (inject a collaborator) to IS-A (extend). Inheritance locks you into one axis of variation and breaks encapsulation of the parent. Say this in every LLD interview.",
            },
          ],
        },
        {
          id: "class-relationships",
          title: "Class relationships",
          summary: "Association, aggregation, composition, dependency — and how to say them in UML.",
          blocks: [
            {
              t: "table",
              head: ["Relationship", "Meaning", "Lifetime", "Example", "UML arrow"],
              rows: [
                ["Dependency", "uses briefly (parameter/local)", "none", "OrderService uses EmailValidator", "dashed →"],
                ["Association", "knows about (field reference)", "independent", "Teacher ↔ Student", "solid →"],
                ["Aggregation", "HAS-A, shared parts", "part outlives whole", "Team ◇— Player", "hollow diamond"],
                ["Composition", "OWNS-A, exclusive parts", "part dies with whole", "House ◆— Room", "filled diamond"],
                ["Inheritance", "IS-A", "—", "Circle —▷ Shape", "hollow triangle"],
                ["Realization", "implements", "—", "ArrayList ---▷ List", "dashed triangle"],
              ],
            },
            {
              t: "code",
              lang: "java",
              code: `class Engine { }
class Car {
  private final Engine engine = new Engine();   // COMPOSITION: Car creates & owns it
}
class Player { }
class Team {
  private List<Player> players;                 // AGGREGATION: players exist without the team
  Team(List<Player> players) { this.players = players; }
}`,
            },
          ],
        },
      ],
    },

    /* ================= PRINCIPLES ================= */
    {
      id: "principles",
      title: "Design Principles",
      desc: "SOLID + DRY/KISS/YAGNI — the rules interviewers listen for.",
      lessons: [
        {
          id: "srp",
          title: "S — Single Responsibility",
          summary: "A class should have exactly one reason to change.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `// BAD: three reasons to change (business rules, persistence, notification)
class Invoice {
  double total() { ... }
  void saveToDb() { ... }
  void emailToCustomer() { ... }
}
// GOOD: one job each — testable, swappable, mergeable in parallel
class Invoice          { double total() { ... } }
class InvoiceRepository{ void save(Invoice i) { ... } }
class InvoiceMailer    { void email(Invoice i) { ... } }`,
            },
            { t: "note", md: "Litmus test: describe the class in one sentence without 'and'. In LLD problems, this is why you split `ParkingLot` from `Ticket` from `PaymentProcessor`." },
          ],
        },
        {
          id: "ocp",
          title: "O — Open/Closed",
          summary: "Open for extension, closed for modification — add types, don't edit switches.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `// BAD: every new shape edits this method (and risks the old cases)
double area(Object s) {
  if (s instanceof Circle c) return Math.PI * c.r * c.r;
  else if (s instanceof Square q) return q.side * q.side;
  ...
}
// GOOD: new behavior = new class, zero edits to existing code
interface Shape { double area(); }
class Circle implements Shape { public double area() { return Math.PI * r * r; } }
class Square implements Shape { public double area() { return side * side; } }`,
            },
            { t: "p", md: "The Strategy, Decorator, and Observer patterns are all OCP machines. A growing `switch` on a type field is the #1 smell to call out." },
          ],
        },
        {
          id: "lsp",
          title: "L — Liskov Substitution",
          summary: "Subtypes must be usable anywhere the parent is — without surprises.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `class Rectangle { void setW(int w); void setH(int h); int area(); }
class Square extends Rectangle {          // classic violation!
  void setW(int w) { super.setW(w); super.setH(w); }  // breaks callers'
  void setH(int h) { super.setW(h); super.setH(h); }  // expectations
}
// A caller doing r.setW(4); r.setH(5); expects area 20 — Square gives 25.
// Fix: don't force the IS-A; make both implement Shape, or make them immutable.`,
            },
            {
              t: "ul",
              items: [
                "Violation smells: overridden method throws `UnsupportedOperationException`, strengthens preconditions, or weakens postconditions.",
                "If a subclass must 'disable' parent behavior, the hierarchy is wrong — use composition.",
              ],
            },
          ],
        },
        {
          id: "isp",
          title: "I — Interface Segregation",
          summary: "Many small role interfaces beat one fat one.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `// BAD: a fat interface forces no-op implementations
interface Machine { void print(); void scan(); void fax(); }
class SimplePrinter implements Machine {
  public void print() { ... }
  public void scan() { throw new UnsupportedOperationException(); }  // ISP + LSP violated
  public void fax()  { throw new UnsupportedOperationException(); }
}
// GOOD: clients depend only on what they use
interface Printer { void print(); }
interface Scanner { void scan(); }
class SimplePrinter implements Printer { public void print() { ... } }
class MultiFunction implements Printer, Scanner { ... }`,
            },
          ],
        },
        {
          id: "dip",
          title: "D — Dependency Inversion",
          summary: "Depend on abstractions; inject them — high-level policy shouldn't know low-level detail.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `// BAD: business logic hard-wired to MySQL — untestable, unswappable
class OrderService {
  private MySqlDb db = new MySqlDb();
}
// GOOD: constructor injection of an abstraction
interface OrderRepository { void save(Order o); }
class OrderService {
  private final OrderRepository repo;
  OrderService(OrderRepository repo) { this.repo = repo; }   // inject Postgres, Mongo, or a mock
}`,
            },
            { t: "note", md: "This is what 'testable design' means: in an interview, always take collaborators via the constructor instead of `new`-ing them inside." },
          ],
        },
        {
          id: "dry-kiss-yagni",
          title: "DRY · KISS · YAGNI",
          summary: "The three sanity principles that balance SOLID.",
          blocks: [
            {
              t: "ul",
              items: [
                "**DRY** — every piece of *knowledge* has one home. Duplicated business rules drift apart. (But: duplicated *code* that represents different knowledge is fine — don't merge coincidences.)",
                "**KISS** — the simplest design that meets today's requirements wins. A factory for one product type is noise.",
                "**YAGNI** — don't build for imagined futures. Add the extension point when the second use case actually arrives.",
                "Interview framing: start simple, name where you'd extend later. \"I'll hard-code one pricing rule now, but put it behind a `PricingStrategy` interface since the prompt hints at multiple.\"",
              ],
            },
          ],
        },
      ],
    },

    /* ================= UML ================= */
    {
      id: "uml",
      title: "UML",
      desc: "Just enough notation to whiteboard a design clearly.",
      lessons: [
        {
          id: "class-diagram",
          title: "Class diagrams",
          summary: "The one diagram you must be fluent in.",
          blocks: [
            {
              t: "code",
              lang: "text",
              code: `┌──────────────────────┐
│      ParkingLot      │   <- class name (italic = abstract)
├──────────────────────┤
│ - floors: List<Floor>│   <- fields:  - private  + public  # protected  _ static
├──────────────────────┤
│ + park(v): Ticket    │   <- methods
└──────────────────────┘

Arrows:
A ──────▷ B    A extends B          (hollow triangle)
A ------▷ B    A implements B       (dashed triangle)
A ───────> B   A has a field of B   (association)
A ◇──────> B   aggregation (shared parts)
A ◆──────> B   composition (owned parts)
A ------> B    dependency (uses in a method)
Multiplicity:  1   0..1   *   1..*   (written at the arrow ends)`,
            },
          ],
        },
        {
          id: "behavioral-diagrams",
          title: "Sequence, state & the rest",
          summary: "When each diagram earns its place on the whiteboard.",
          blocks: [
            {
              t: "table",
              head: ["Diagram", "Shows", "Use in interviews for"],
              rows: [
                ["Sequence", "objects + ordered messages over time", "walking through one flow: 'user parks a car'"],
                ["State machine", "states + transitions + guards", "Vending machine, Elevator, Order lifecycle, Traffic signal"],
                ["Use case", "actors + goals", "clarifying requirements up front"],
                ["Activity", "flowchart with swimlanes", "business processes, rarely needed"],
              ],
            },
            {
              t: "note",
              md: "In a 45-minute LLD round: one class diagram + narrating a sequence verbally is usually enough. Draw a state machine only when the problem *is* one (vending machine, elevator, game turn).",
            },
          ],
        },
      ],
    },

    /* ================= CREATIONAL ================= */
    {
      id: "creational",
      title: "Creational Patterns",
      desc: "5 patterns that control HOW objects get created.",
      lessons: [
        {
          id: "singleton",
          title: "Singleton",
          summary: "Exactly one instance, globally reachable — use sparingly.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `class Config {
  private static volatile Config instance;          // volatile for safe publish
  private Config() {}                               // no outside construction
  static Config getInstance() {
    if (instance == null) {                         // double-checked locking
      synchronized (Config.class) {
        if (instance == null) instance = new Config();
      }
    }
    return instance;
  }
}
enum ConfigEnum { INSTANCE; }   // the BEST Java singleton: thread/serialization/reflection-safe
class Holder {                  // or: initialization-on-demand holder (lazy, no locks)
  private static class H { static final Config I = new Config(); }
  static Config get() { return H.I; }
}`,
            },
            { t: "note", md: "When asked: mention it hides dependencies and hurts testability — 'in real code I'd let a DI container manage one instance instead'. Used in: Logger, Config, ConnectionPool." },
          ],
        },
        {
          id: "factory-method",
          title: "Factory Method",
          summary: "Let subclasses (or one method) decide which concrete class to instantiate.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `interface Notification { void send(String msg); }
class Email implements Notification { public void send(String m) { ... } }
class Sms   implements Notification { public void send(String m) { ... } }

class NotificationFactory {
  static Notification create(String type) {         // ONE home for the switch
    return switch (type) {
      case "email" -> new Email();
      case "sms"   -> new Sms();
      default -> throw new IllegalArgumentException(type);
    };
  }
}
// Callers never 'new' concrete types -> adding Push touches only the factory.`,
            },
            { t: "p", md: "Use when creation logic would otherwise be duplicated at every call site, or the concrete type depends on config/input. In LLD problems: creating vehicles, pieces, payment handlers." },
          ],
        },
        {
          id: "abstract-factory",
          title: "Abstract Factory",
          summary: "A factory of factories: create whole FAMILIES of related objects.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `interface Button { void render(); }
interface Checkbox { void render(); }
interface UiFactory { Button button(); Checkbox checkbox(); }   // the family

class MacFactory implements UiFactory {
  public Button button() { return new MacButton(); }
  public Checkbox checkbox() { return new MacCheckbox(); }
}
class WinFactory implements UiFactory { ... }

UiFactory f = os.equals("mac") ? new MacFactory() : new WinFactory();
f.button();   // guaranteed style-consistent family`,
            },
            { t: "p", md: "Choose over Factory Method when products must be **consistent with each other** (themes, DB driver families: Connection+Command+Transaction)." },
          ],
        },
        {
          id: "builder",
          title: "Builder",
          summary: "Assemble complex objects step by step; kill telescoping constructors.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `class Pizza {
  private final String size; private final boolean cheese, olives;
  private Pizza(Builder b) { size = b.size; cheese = b.cheese; olives = b.olives; }

  static class Builder {
    private String size = "M"; private boolean cheese, olives;
    Builder size(String s)   { size = s; return this; }
    Builder cheese()         { cheese = true; return this; }
    Builder olives()         { olives = true; return this; }
    Pizza build() {                          // validate cross-field invariants here
      return new Pizza(this);
    }
  }
}
Pizza p = new Pizza.Builder().size("L").cheese().build();`,
            },
            { t: "note", md: "Signals to use it: constructor with 4+ params, many optional fields, or immutability wanted. Real examples: `StringBuilder`, `Stream.builder()`, Lombok `@Builder`, OkHttp Request." },
          ],
        },
        {
          id: "prototype",
          title: "Prototype",
          summary: "Clone a pre-configured instance instead of building from scratch.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `interface Shape { Shape clone(); }
class Circle implements Shape {
  int r; Paint paint;                     // paint is expensive to configure
  Circle(Circle src) { r = src.r; paint = src.paint.copy(); }  // DEEP copy!
  public Circle clone() { return new Circle(this); }
}
// A canvas 'duplicate shape' command = selected.clone() — no giant switch on type.`,
            },
            { t: "note", md: "Prefer copy constructors over Java's broken `Cloneable`. Watch shallow vs deep copy of mutable fields — that's the interview follow-up. (This is literally the duplicate-shape feature in a whiteboard app.)" },
          ],
        },
      ],
    },

    /* ================= STRUCTURAL ================= */
    {
      id: "structural",
      title: "Structural Patterns",
      desc: "7 patterns that compose objects into larger structures.",
      lessons: [
        {
          id: "adapter",
          title: "Adapter",
          summary: "Wrap an incompatible interface so existing callers can use it.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `interface PaymentGateway { void pay(double amount); }        // what OUR code expects
class StripeSdk { void makeCharge(long cents, String cur) { ... } }  // what we GOT

class StripeAdapter implements PaymentGateway {
  private final StripeSdk stripe = new StripeSdk();
  public void pay(double amount) {
    stripe.makeCharge(Math.round(amount * 100), "USD");   // translate
  }
}
// Checkout code depends only on PaymentGateway — swap Stripe/Razorpay freely.`,
            },
            { t: "p", md: "Use for third-party SDKs and legacy code. JDK examples: `Arrays.asList`, `InputStreamReader` (bytes → chars)." },
          ],
        },
        {
          id: "decorator",
          title: "Decorator",
          summary: "Stack behavior onto an object at runtime — same interface, wrapped.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `interface Coffee { double cost(); String desc(); }
class Basic implements Coffee { public double cost() { return 50; } public String desc() { return "coffee"; } }

abstract class Topping implements Coffee {          // decorator base wraps a Coffee
  protected final Coffee inner;
  Topping(Coffee inner) { this.inner = inner; }
}
class Milk extends Topping {
  Milk(Coffee c) { super(c); }
  public double cost() { return inner.cost() + 10; }
  public String desc() { return inner.desc() + " + milk"; }
}
Coffee order = new Milk(new Milk(new Basic()));     // stack freely: 70, "coffee + milk + milk"`,
            },
            { t: "note", md: "Decorator vs inheritance: n toppings = n classes, not 2^n subclasses. JDK: `BufferedReader(new FileReader(...))` — the entire java.io stack. Pizza-with-toppings & coffee-shop LLD problems are Decorator on a plate." },
          ],
        },
        {
          id: "facade",
          title: "Facade",
          summary: "One simple front door to a messy subsystem.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `class OrderFacade {
  private final Inventory inventory; private final Payments payments; private final Shipping shipping;
  OrderResult placeOrder(Cart cart, Card card) {
    inventory.reserve(cart);
    payments.charge(card, cart.total());
    return shipping.schedule(cart);
  }        // callers see ONE method; the choreography is hidden + reusable
}`,
            },
            { t: "p", md: "Facade *simplifies* (new interface over many classes); Adapter *translates* (existing interface over one class). Say that contrast out loud." },
          ],
        },
        {
          id: "composite",
          title: "Composite",
          summary: "Treat single items and groups uniformly — trees of parts.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `interface Node { long size(); }
class File implements Node {
  long bytes;
  public long size() { return bytes; }
}
class Folder implements Node {
  List<Node> children = new ArrayList<>();
  public long size() {                       // recursion falls out naturally
    return children.stream().mapToLong(Node::size).sum();
  }
}
// Groups in a canvas, UI view trees, org charts, menus — all Composite.`,
            },
            { t: "note", md: "This is the scene graph of every design tool — a Figma/tldraw 'group' is a Composite of shapes. Lead with that in your interviews." },
          ],
        },
        {
          id: "proxy",
          title: "Proxy",
          summary: "A stand-in with the same interface: lazy-load, guard, cache, or log access.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `interface Image { void display(); }
class RealImage implements Image {
  RealImage(String path) { loadFromDisk(path); }    // expensive!
  public void display() { ... }
}
class LazyImageProxy implements Image {
  private final String path; private RealImage real;
  LazyImageProxy(String path) { this.path = path; }
  public void display() {
    if (real == null) real = new RealImage(path);   // created only when needed
    real.display();
  }
}`,
            },
            { t: "p", md: "Flavors: virtual (lazy), protection (auth check), remote (RPC stubs), caching. Spring AOP and Hibernate lazy-loading are proxies. Decorator adds behavior; Proxy controls **access**." },
          ],
        },
        {
          id: "flyweight",
          title: "Flyweight",
          summary: "Share immutable intrinsic state across thousands of objects.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `class Glyph { final char c; final Font font; }        // intrinsic: SHARED
// extrinsic (position x,y) is passed in at draw time, not stored per object
class GlyphFactory {
  private static final Map<String, Glyph> cache = new HashMap<>();
  static Glyph get(char c, Font f) {
    return cache.computeIfAbsent(c + f.name(), k -> new Glyph(c, f));
  }
}
// 1M chars of text -> ~100 glyph objects + positions. Integer.valueOf's
// -128..127 cache and the String pool are JDK flyweights.`,
            },
            { t: "note", md: "Your rendering tie-in: texture atlases and glyph caches in Skia are flyweights — 10k shapes sharing paint/style objects is exactly this." },
          ],
        },
        {
          id: "bridge",
          title: "Bridge",
          summary: "Split one hierarchy into two independent dimensions (abstraction ⟂ implementation).",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `interface Renderer { void drawCircle(float r); }      // dimension 2: HOW
class VectorRenderer implements Renderer { ... }
class RasterRenderer implements Renderer { ... }

abstract class Shape {                                 // dimension 1: WHAT
  protected final Renderer renderer;                   // the BRIDGE
  Shape(Renderer r) { renderer = r; }
  abstract void draw();
}
class Circle extends Shape {
  float r;
  Circle(Renderer rd, float r) { super(rd); this.r = r; }
  void draw() { renderer.drawCircle(r); }
}
// Without bridge: VectorCircle, RasterCircle, VectorSquare... m*n class explosion.`,
            },
            { t: "p", md: "Literally your world: Shape × Renderer (Skia CPU / GPU backend) is the canonical Bridge. JDBC (`Driver` behind the API) is the JDK example." },
          ],
        },
      ],
    },

    /* ================= BEHAVIORAL ================= */
    {
      id: "behavioral",
      title: "Behavioral Patterns",
      desc: "11 patterns for how objects communicate and share responsibility.",
      lessons: [
        {
          id: "strategy",
          title: "Strategy",
          summary: "Swap an algorithm at runtime — the most-used pattern in LLD interviews.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `interface PricingStrategy { double price(Ride ride); }
class NormalPricing implements PricingStrategy { public double price(Ride r) { return r.km * 10; } }
class SurgePricing  implements PricingStrategy { public double price(Ride r) { return r.km * 10 * 1.8; } }

class FareCalculator {
  private PricingStrategy strategy;                    // injected + swappable
  void setStrategy(PricingStrategy s) { strategy = s; }
  double fare(Ride r) { return strategy.price(r); }
}
// Comparator IS a strategy. Payment methods, parking fee rules, split rules
// (Splitwise), matching algorithms (Uber) — all Strategy.`,
            },
          ],
        },
        {
          id: "observer",
          title: "Observer",
          summary: "Publish/subscribe: dependents get notified on state change.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `interface Observer { void update(double price); }
class Stock {
  private final List<Observer> observers = new ArrayList<>();
  private double price;
  void subscribe(Observer o) { observers.add(o); }
  void setPrice(double p) {
    price = p;
    for (Observer o : observers) o.update(p);          // notify all
  }
}
// UI listeners, notification fan-out, order-status updates, cache invalidation.`,
            },
            { t: "note", md: "Follow-ups to expect: unsubscribe (memory leaks from forgotten listeners!), notify order, sync vs async delivery, and what happens if an observer throws." },
          ],
        },
        {
          id: "state",
          title: "State",
          summary: "An object whose behavior changes with its state — one class per state, no mega-switch.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `interface MachineState {
  void insertCoin(VendingMachine m);
  void dispense(VendingMachine m);
}
class Idle implements MachineState {
  public void insertCoin(VendingMachine m) { m.setState(new HasCoin()); }
  public void dispense(VendingMachine m) { System.out.println("pay first"); }
}
class HasCoin implements MachineState {
  public void insertCoin(VendingMachine m) { System.out.println("already paid"); }
  public void dispense(VendingMachine m) { m.release(); m.setState(new Idle()); }
}
class VendingMachine {
  private MachineState state = new Idle();
  void setState(MachineState s) { state = s; }
  void insertCoin() { state.insertCoin(this); }        // delegate everything
  void dispense()  { state.dispense(this); }
}`,
            },
            { t: "p", md: "Use whenever the prompt has a lifecycle: vending machine, elevator (idle/moving/doors), order (placed/paid/shipped), traffic light, game turns." },
          ],
        },
        {
          id: "command",
          title: "Command",
          summary: "Reify an action as an object → queues, logs, and UNDO.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `interface Command { void execute(); void undo(); }
class AddShape implements Command {
  private final Canvas canvas; private final Shape shape;
  AddShape(Canvas c, Shape s) { canvas = c; shape = s; }
  public void execute() { canvas.add(shape); }
  public void undo()    { canvas.remove(shape); }
}
class History {
  private final Deque<Command> undoStack = new ArrayDeque<>();
  void run(Command c) { c.execute(); undoStack.push(c); }
  void undo() { if (!undoStack.isEmpty()) undoStack.pop().undo(); }
}`,
            },
            { t: "note", md: "Your editor's undo stack IS this pattern — and in Vani, collaborative undo means undoing *transformed* commands (tie to OT). Also: task queues, transactional macros, remote controls." },
          ],
        },
        {
          id: "template-method",
          title: "Template Method",
          summary: "Fix the skeleton of an algorithm in a base class; let subclasses fill in steps.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `abstract class DataImporter {
  final void run() {          // final: the SKELETON never changes
    var raw = fetch();
    var rows = parse(raw);
    validate(rows);           // optional hook with default
    save(rows);
  }
  abstract String fetch();
  abstract List<Row> parse(String raw);
  void validate(List<Row> rows) { }        // hook
  void save(List<Row> rows) { db.saveAll(rows); }
}
class CsvImporter extends DataImporter { ... }   // fills in fetch/parse only`,
            },
            { t: "p", md: "Template Method = inheritance-flavored; Strategy = composition-flavored. If steps vary independently or at runtime, prefer Strategy." },
          ],
        },
        {
          id: "iterator",
          title: "Iterator",
          summary: "Sequential access without exposing internal structure.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `class Playlist implements Iterable<Song> {
  private final List<Song> songs = new ArrayList<>();
  public Iterator<Song> iterator() {
    return new Iterator<>() {
      int i = 0;
      public boolean hasNext() { return i < songs.size(); }
      public Song next() { return songs.get(i++); }
    };
  }
}
for (Song s : playlist) { ... }    // for-each works on any Iterable
// LC 341 Flatten Nested List Iterator / 284 Peeking Iterator are this pattern as problems.`,
            },
          ],
        },
        {
          id: "chain-of-responsibility",
          title: "Chain of Responsibility",
          summary: "Pass a request along handlers until one takes it.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `abstract class SupportHandler {
  protected SupportHandler next;
  SupportHandler setNext(SupportHandler n) { next = n; return n; }
  void handle(Ticket t) {
    if (canHandle(t)) process(t);
    else if (next != null) next.handle(t);
  }
  abstract boolean canHandle(Ticket t);
  abstract void process(Ticket t);
}
// bot.setNext(l1).setNext(l2).setNext(manager);
// Servlet filters, middleware stacks, logging levels, ATM cash dispensing (2000->500->100 notes).`,
            },
          ],
        },
        {
          id: "mediator",
          title: "Mediator",
          summary: "Centralize many-to-many communication in one hub.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `class ChatRoom {                              // the mediator
  private final List<User> users = new ArrayList<>();
  void join(User u) { users.add(u); }
  void send(String msg, User from) {
    for (User u : users) if (u != from) u.receive(msg);
  }
}
class User {
  private final ChatRoom room;                // users know the ROOM, not each other
  void send(String msg) { room.send(msg, this); }
  void receive(String msg) { ... }
}
// Air-traffic control, chat rooms, dialog boxes coordinating widgets. n^2 links -> n.`,
            },
          ],
        },
        {
          id: "memento",
          title: "Memento",
          summary: "Snapshot state for restore — without exposing internals.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `class Editor {
  private String text;
  Memento save() { return new Memento(text); }
  void restore(Memento m) { text = m.text; }
  static class Memento {                       // opaque to everyone else
    private final String text;
    private Memento(String t) { text = t; }
  }
}
Deque<Editor.Memento> history = new ArrayDeque<>();
history.push(editor.save());   // before each change
editor.restore(history.pop()); // undo`,
            },
            { t: "p", md: "Memento stores **state snapshots**; Command stores **operations**. Snapshot undo is simpler but heavier — operation undo (Command) scales and is what collaborative editors need." },
          ],
        },
        {
          id: "visitor",
          title: "Visitor",
          summary: "Add new operations over a fixed object structure via double dispatch.",
          blocks: [
            {
              t: "code",
              lang: "java",
              code: `interface ShapeVisitor { void visit(Circle c); void visit(Rect r); }
interface Shape { void accept(ShapeVisitor v); }
class Circle implements Shape { public void accept(ShapeVisitor v) { v.visit(this); } }
class Rect   implements Shape { public void accept(ShapeVisitor v) { v.visit(this); } }

class AreaCalculator implements ShapeVisitor {
  double total;
  public void visit(Circle c) { total += Math.PI * c.r * c.r; }
  public void visit(Rect r)   { total += r.w * r.h; }
}
// New OPERATION (export SVG, hit-test) = new visitor, zero shape edits.
// New TYPE = edit every visitor — that's the trade-off to state.`,
            },
            { t: "p", md: "Compilers/ASTs, document exporters, scene-graph traversals. Visitor wins when operations change more often than the type set." },
          ],
        },
      ],
    },

    /* ================= METHOD ================= */
    {
      id: "method",
      title: "The LLD Interview Method",
      desc: "The repeatable 6-step script for any 'Design X' machine-coding round.",
      lessons: [
        {
          id: "lld-framework",
          title: "The 6-step script",
          summary: "Requirements → entities → relationships → patterns → code core → walk a flow.",
          blocks: [
            {
              t: "ul",
              items: [
                "**1. Requirements (3-5 min):** scope in/out loud. \"Multiple floors? Payment? Concurrency?\" Write 4-6 functional bullets.",
                "**2. Identify entities:** nouns in the prompt → classes; verbs → methods. Enums for fixed sets (VehicleType, OrderStatus).",
                "**3. Relationships:** who owns whom (composition), who references whom (association), multiplicities.",
                "**4. Name the patterns as you use them:** \"fee rules vary → Strategy\", \"machine has states → State\", \"notify observers on X\".",
                "**5. Code the core:** interfaces + 2-3 key classes fully; sketch the rest. Enforce invariants in constructors/methods, not comments.",
                "**6. Walk one end-to-end flow** (park a car, place an order) and mention concurrency: which structure becomes a `ConcurrentHashMap`, which method needs a lock.",
              ],
            },
            {
              t: "note",
              md: "Score-losers: skipping requirements, God classes, getters/setters on everything (anemic domain), never naming a pattern, ignoring thread-safety when the prompt says 'multiple users'.",
            },
          ],
        },
      ],
    },

    /* ================= PROBLEMS (imported) ================= */
    ...LLD_PROBLEM_SECTIONS,
  ],
};
