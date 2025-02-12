

# REWRIE & REFACTORING

## REFACTORING
1) CURRENT SYSTEM DESIGN
2) System Design With Bounded Context
* Core Domain ==? effiect on our business like payment.
* Supporting Domain ==> like Discount, Delivery.
* Generic Domain ==> like Auth, Notification.
* Relation on Services ==> us<Up Stream>,DS<Domain Stream>
## REWRITE

# Spaghetti code
* Spaghetti code is the general term used for any source code that's hard to understand because it has no defined structure. While an end user might not see anything wrong with a program, a programmer might find it virtually illegible if the code base's flow is too convoluted—like a bowl of twisted, tangled spaghetti.
# Tactical Forking
* Tactical Forking is the process of dividing a monolithic service into smaller, independent parts. This approach helps in gradually transitioning from a monolithic architecture to a microservices-based system, improving scalability, maintainability, and flexibility.

# Strangler Fig
* A Strangler Fig is a type of fig tree that wraps around a host tree. It starts as a small plant growing on the main tree and gradually extends its roots downward while climbing upward toward the sunlight. Over time, the Strangler Fig grows stronger, eventually replacing the host tree as it dies and decomposes.

# Branch By Abstraction
it is smaller than Strangler Fig and youput a rawpper