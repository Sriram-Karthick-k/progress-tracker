import { ResourceDomain } from "../resource-types";

// SPRING BOOT — comprehensive curated FREE resources.
export const SPRING: ResourceDomain = {
  key: "spring",
  name: "Spring Boot",
  tagline: "IoC/DI, auto-config, the web & data layers, AOP, security, testing, and production concerns.",
  icon: "Leaf",
  accent: "from-green-500 to-emerald-600",
  sections: [
    {
      id: "start",
      title: "Start here",
      topics: [
        {
          id: "guides",
          title: "Official guides & docs",
          blurb: "Short hands-on guides plus the full reference and Baeldung's library.",
          resources: [
            { kind: "docs", label: "Spring Guides (hands-on)", by: "spring.io", url: "https://spring.io/guides" },
            { kind: "docs", label: "Spring Boot reference docs", by: "spring.io", url: "https://docs.spring.io/spring-boot/index.html" },
            { kind: "article", label: "Spring Boot tutorials", by: "Baeldung", url: "https://www.baeldung.com/spring-boot" },
            { kind: "video", label: "Spring Boot full course", by: "freeCodeCamp", url: "https://www.freecodecamp.org/news/spring-boot-tutorial/" },
          ],
        },
      ],
    },
    {
      id: "core",
      title: "Core container",
      topics: [
        {
          id: "ioc-di",
          title: "IoC, dependency injection & beans",
          blurb: "The container, constructor injection, bean scopes & lifecycle.",
          resources: [
            { kind: "article", label: "IoC & Dependency Injection", by: "Baeldung", url: "https://www.baeldung.com/inversion-control-and-dependency-injection-in-spring" },
            { kind: "article", label: "Bean scopes", by: "Baeldung", url: "https://www.baeldung.com/spring-bean-scopes" },
          ],
        },
        {
          id: "config",
          title: "Configuration, profiles & auto-configuration",
          blurb: "@Configuration/@Bean, application.yml, @Value, profiles, how auto-config works.",
          resources: [
            { kind: "article", label: "Spring profiles", by: "Baeldung", url: "https://www.baeldung.com/spring-profiles" },
            { kind: "article", label: "Spring Boot auto-configuration", by: "Baeldung", url: "https://www.baeldung.com/spring-boot-annotations" },
          ],
        },
      ],
    },
    {
      id: "web",
      title: "Web layer",
      topics: [
        {
          id: "rest",
          title: "REST controllers",
          blurb: "@RestController, request lifecycle, DTOs vs entities, pagination, versioning.",
          resources: [
            { kind: "docs", label: "Building a RESTful web service (guide)", by: "spring.io", url: "https://spring.io/guides/gs/rest-service" },
            { kind: "article", label: "REST with Spring series", by: "Baeldung", url: "https://www.baeldung.com/rest-with-spring-series" },
          ],
        },
        {
          id: "validation-errors",
          title: "Validation & exception handling",
          blurb: "@Valid + Bean Validation; @ControllerAdvice instead of scattered try/catch.",
          resources: [
            { kind: "article", label: "Validation in Spring Boot", by: "Baeldung", url: "https://www.baeldung.com/spring-boot-bean-validation" },
            { kind: "article", label: "Error handling for REST (@ControllerAdvice)", by: "Baeldung", url: "https://www.baeldung.com/exception-handling-for-rest-with-spring" },
          ],
        },
      ],
    },
    {
      id: "data",
      title: "Data layer",
      topics: [
        {
          id: "jpa",
          title: "Spring Data JPA & repositories",
          blurb: "Entity mapping, derived queries, @Query, pagination.",
          resources: [
            { kind: "docs", label: "Accessing data with JPA (guide)", by: "spring.io", url: "https://spring.io/guides/gs/accessing-data-jpa" },
            { kind: "article", label: "Spring Data JPA guide", by: "Baeldung", url: "https://www.baeldung.com/the-persistence-layer-with-spring-data-jpa" },
          ],
        },
        {
          id: "transactions",
          title: "Transactions & the N+1 problem",
          blurb: "@Transactional (self-invocation trap, propagation), lazy vs eager, fetch joins.",
          resources: [
            { kind: "article", label: "@Transactional guide", by: "Baeldung", url: "https://www.baeldung.com/transaction-configuration-with-jpa-and-spring" },
            { kind: "article", label: "The N+1 query problem", by: "Baeldung", url: "https://www.baeldung.com/spring-data-jpa-n-plus-1" },
          ],
        },
      ],
    },
    {
      id: "cross-cutting",
      title: "Cross-cutting & production",
      topics: [
        {
          id: "aop-cache-async",
          title: "AOP, caching, async & scheduling",
          blurb: "Proxies (why @Transactional/@Async behave as they do), @Cacheable, @Scheduled.",
          resources: [
            { kind: "article", label: "Intro to Spring AOP", by: "Baeldung", url: "https://www.baeldung.com/spring-aop" },
            { kind: "article", label: "Caching with @Cacheable", by: "Baeldung", url: "https://www.baeldung.com/spring-cache-tutorial" },
          ],
        },
        {
          id: "security",
          title: "Spring Security & JWT",
          blurb: "The filter chain, authentication vs authorization, JWT flow.",
          resources: [
            { kind: "docs", label: "Securing a web application (guide)", by: "spring.io", url: "https://spring.io/guides/gs/securing-web" },
            { kind: "article", label: "Spring Security series", by: "Baeldung", url: "https://www.baeldung.com/security-spring" },
          ],
        },
        {
          id: "testing",
          title: "Testing",
          blurb: "@SpringBootTest vs slice tests (@WebMvcTest/@DataJpaTest), MockMvc, Testcontainers.",
          resources: [
            { kind: "article", label: "Testing in Spring Boot", by: "Baeldung", url: "https://www.baeldung.com/spring-boot-testing" },
            { kind: "article", label: "Testcontainers with Spring Boot", by: "Baeldung", url: "https://www.baeldung.com/spring-boot-testcontainers-integration-test" },
          ],
        },
        {
          id: "actuator",
          title: "Actuator & observability",
          blurb: "Health, metrics, and production-readiness endpoints.",
          resources: [
            { kind: "docs", label: "Building a RESTful web service with Actuator (guide)", by: "spring.io", url: "https://spring.io/guides/gs/actuator-service" },
          ],
        },
      ],
    },
  ],
};
