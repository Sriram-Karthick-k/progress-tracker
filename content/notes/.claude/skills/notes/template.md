# <Topic> — <what angle: patterns / internals / pitfalls>

<One or two sentences: the single idea that frames the whole topic.>

> [!TIP]
> **TL;DR: the 30-second interview answer**
> - <Default choice / core definition, with the **key term** bolded>
> - <The hard part or main trade-off>
> - <How it shows up in Spring Boot / your stack>

## <Topic> at a glance

```mermaid
mindmap
  root((<Topic>))
    <Branch 1>
      <leaf>
      <leaf>
    <Branch 2>
      <leaf>
      <leaf>
    <Branch 3>
      <leaf>
      <leaf>
```

## Mental model

```mermaid
flowchart LR
    U([👤 Client]) --> A[<Component A>]
    A -->|1 · <step>| B[(<Store B>)]
    A -->|2 · <step>| C[(<Store C>)]
    classDef app   fill:#e0e7ff,stroke:#6366f1,color:#1e1b4b
    classDef store fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef db    fill:#ffedd5,stroke:#ea580c,color:#7c2d12
    class A app
    class B store
    class C db
```

<One paragraph: what to notice in the picture.>

## How it works

```mermaid
sequenceDiagram
    autonumber
    participant A as <Caller>
    participant B as <Middle>
    participant C as <Backend>
    A->>B: <call>
    alt <happy path>
        B-->>A: <result>
    else <other path>
        B->>C: <call>
        C-->>B: <result>
        B-->>A: <result>
    end
    Note over A,B: <the one rule to remember>
```

## <Options> compared

| Option | How it works | Trade-off | Risk | Use when |
|---|---|---|---|---|
| **<A>** | | | | ✅ <default case> |
| **<B>** | | | | |

## Choosing <an option>

```mermaid
flowchart TD
    Q1{<Question 1?>} -->|No| X[<Don't do it>]:::warn
    Q1 -->|Yes| Q2{<Question 2?>}
    Q2 -->|Yes| A[<Option A>]:::good
    Q2 -->|No| B[<Option B>]:::good
    classDef good fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef warn fill:#fef3c7,stroke:#d97706,color:#78350f
```

## In Spring Boot

<One sentence on the mechanism: which proxy / bean / auto-configuration does the work.>

```java
// minimal, real, compiling example; comment only the non-obvious line
```

```yaml
# the config that matters
```

> [!WARNING]
> **<The trap, as a rule.>** <Why it happens and how to avoid it.>

## Failure modes

| Problem | Symptom | Fix |
|---|---|---|
| **<A>** | | |
| **<B>** | | |

## Interview questions

<details>
<summary><Why … / What breaks if …?></summary>

<2–4 sentence answer.>
</details>

<details>
<summary><Compare X and Y: when would you pick each?></summary>

<2–4 sentence answer.>
</details>

<details>
<summary><How would you fix / debug …?></summary>

<2–4 sentence answer.>
</details>

## Key takeaways

| Remember | Because |
|---|---|
| <rule> | <reason> |
| <rule> | <reason> |

**Related:** [<Sibling note>](/notebook/<path>)
