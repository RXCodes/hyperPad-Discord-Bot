![Banner](https://raw.githubusercontent.com/RXCodes/Project-Spark/refs/heads/main/banner.jpg)

## 📌 Goal
The goal of this project is to better moderate the hyperPad discord server while also providing additional services. The source code of this repository will be kept public for complete transparency and is free to reuse to better serve other Discord servers until further notice. Bots and malicious actors can join a server and cause havoc, which this project aims to prevent and minimize. Current implementations either do not work or are too sensitive - Spark allows fined-tuned controls and methods that fit with our server.

## ✅ Current Capabilities
Spark has a few **preprogrammed goals** as defined in `discord/goals/`. If a user violates a goal, Spark will take action on the user.
Currently, Spark can:

-   Prevent users from sending too many messages within a short time span.
-   Stop users from sending similar long messages multiple times.
-   Roughly calculate the typing speed of a user, and flag those who are typing way too fast _(spamming)_.
-   Block messages and take action based on configurable filters.
-   Block job applications and resumes - block job offer messages that offer nothing in value.
-   Use a language model to determine if messages violate server rules *(e.g., detecting harrassment, threats, etc.)*.

**All moderation logic runs locally, and does not rely on external websites or costly APIs!**

## ⭐️ Future Plans
Spark *may* integrate into hyperPad web services, such as sending messages when a project gets shared, showcasing new featured projects, automatic alerts when new betas and updates are released, alerts on pull requests and more. More moderation goals will be worked on as the server grows. Potentially, there can be additional miscellaneous features to improve the community experience. 
