# 0. Glossary: the words patterns use

A pocket dictionary for the LLD pattern notes. It only holds words we have already used, and a row is added when a step introduces a new word.

## "Abstract" and "concrete"

Pattern names come in pairs, and the two words always mean the same thing:

- **Abstract X** is the contract: an interface or abstract class. It says *what* has to be done and holds no real logic.
- **Concrete X** is a real class that fills the contract in. It says *how*.

| Pair | Pattern | Where |
|---|---|---|
| Strategy and concrete strategy | Strategy | Now: `FareStrategy` and `TatkalFare` |
| State and concrete state | State | Now: `BookingState` and `HeldState` |
| Command and concrete command | Command | Later |
| Observer and concrete observer | Observer | Now: `BookingObserver` and `EmailNotifier` |
| Product and concrete product | Factory Method | Now: `PaymentClient` and `RazorpayClient` |
| Abstract factory and concrete factory (also abstract product and concrete product) | Abstract Factory | Later |
| Component and concrete component (also decorator and concrete decorator) | Decorator | Later |

Not every part has a pair. In Strategy only the strategy side is split into abstract and concrete. The context is an ordinary class, so there is no "abstract context" here.

## Terms used so far

| Term | What it means | In the fare example |
|---|---|---|
| Design pattern | A named, reusable answer to a design problem that keeps coming back | Strategy |
| Smell (code smell) | A sign in the code that a pattern would help. It is not a bug | The growing `if/else` in `fare()` |
| Context | The class that needs the job done. It holds a strategy and calls it | `FareService` |
| Strategy | The interface that says what the job looks like | `FareStrategy` |
| Concrete strategy | One real class that implements the interface. One way to do the job | `TatkalFare`, `SeniorFare`, `BaseFare` |
| Client or caller | Whoever uses the context: a controller or a test | The controller that asks for a fare |
| Interface | A contract of method signatures with no logic | `FareStrategy` |
| Precedence | Which strategy wins when several could apply. Here it is the first one in the `@Order` list | Tatkal before rail pass before senior |
| Default (catch-all) strategy | The strategy that always applies, so it goes last | `BaseFare` |
| Subject (publisher) | The object that announces that something happened and keeps the list of observers | `BookingService` |
| Observer (listener, subscriber) | The interface for anything that wants to react to the subject | `BookingObserver` |
| Event | The description of what happened, passed to every observer | A booking was confirmed |
| Subscribe (register) | Adding an observer to the subject's list | `EmailNotifier` joins the list |
| Notify | The subject calling every observer on its list | `confirm` announces the confirmed booking |
| Synchronous | The caller waits until the work has finished, on the same thread | The loop in `BookingService` waits for every observer |
| Asynchronous | The work runs on another thread or through a queue, and the caller does not wait | `@Async` or a Kafka consumer |
| State (the interface) | The interface that lists what can be done to the object, whatever its status | `BookingState` |
| Concrete state | One class per status, holding that status's rules | `HeldState`, `ConfirmedState` |
| Transition | A move from one status to the next, made by the current state | HELD to CONFIRMED |
| Product | The interface of the thing a factory creates | `PaymentClient` |
| Concrete product | One real class that a factory can create | `RazorpayClient`, `PaytmClient` |
| Factory | The one place that decides which concrete class to create and builds it | `PaymentClientFactory` |
| Factory method | The method of the factory that creates and returns the product | `create(merchant)` |
| Creator | In the Gang of Four Factory Method, the abstract class that holds the shared flow and the abstract factory method | `PaymentProcessor` |
| Singleton | The one instance of a class that every caller shares | `TicketNumberGenerator` |
| Private constructor | A constructor only the class itself can call, so nobody else can make another instance | `private TicketNumberGenerator()` |
| Access point | The method that hands out the one instance | `getInstance()` |
| Constructor injection | A class receives what it needs through its constructor, so the dependency is visible and a test can pass a fake | `SpringBookingService(NumberGenerator numbers)` |
| Singleton scope | Spring's default: the container creates one instance of the bean and shares it | `@Component` on `NumberGenerator` |

## Words from the map

| Term | What it means |
|---|---|
| LLD (low-level design) | Designing the classes inside one service |
| HLD (high-level design) | Designing the services, queues and stores between them |
| GoF (Gang of Four) | The four authors of the book that named the 23 classic patterns |
| Behavioural pattern | Decides who does what at run time (strategy, observer, state) |
| Creational pattern | Decides how objects are made (factory, builder, singleton) |
| Structural pattern | Decides how objects are wired together (decorator, adapter, composite) |
| Tier | Our priority group: tier 1 is asked most, tier 4 is rare |
| Machine-coding round | An interview where you write working classes for a small problem, such as a parking lot |

**Related:** [LLD patterns: the map](/notebook/system-design/pattern/lld/overview) · [Strategy](/notebook/system-design/pattern/lld/strategy)
