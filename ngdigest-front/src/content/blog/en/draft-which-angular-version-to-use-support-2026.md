---
title: "Which Angular version should you use for your project?"
slug: "which-angular-version-to-use-support-2026"
description: "Choose an Angular version based on support, dependencies and risk. A practical method to plan the next upgrade of your application."
date: "2026-09-12"
author: "Sara Ounissi"
tags: ["angular", "freelance", "migration", "ecosystem"]
lang: "en"
alternate: "quelle-version-angular-utiliser-support-2026"
---

## Which Angular version should you choose for your project?

The right choice depends on what is already in production and what needs to keep working. Here is where I would start:

- **Starting a new application:** use the latest supported stable version after checking the libraries you need.
- **Using Angular 21:** it is still supported. Prepare the next steps without treating every major release as an emergency.
- **Using Angular 20:** support is scheduled to end on 28 November 2026. Identify migration blockers and make time to address them.
- **Using an older version:** review dependencies, upgrade steps and critical user journeys before estimating the work.

An application can still work after support ends. Equally, using a supported version does not require an immediate upgrade. Decide using the support deadline, project constraints and a verification plan.

## Active support, LTS and end of support: what changes for you

A version can be supported without receiving new features. There are three situations to distinguish:

- **Active support:** the version receives regular updates and fixes.
- **LTS:** it still receives the critical and security fixes covered by Angular's policy, rather than new features from active development.
- **End of support:** it falls outside Angular's announced maintenance window. Your application does not stop working that day, but you can no longer rely on that coverage.

As checked on 2 November 2026, Angular 22 is actively supported, Angular 21 is in LTS until June 2027, and Angular 20 is in LTS until 28 November 2026. Recheck the dates when scheduling the work.

Record the installed version, its support deadline and dependencies that could delay the upgrade. That gives you a practical starting point for deciding when to act.

## Check dependencies before choosing the target

Angular does not exist in isolation. A component library, rich-text editor or internal tool may delay an upgrade. Before setting a date, check which Angular versions those dependencies support, along with the Node.js, TypeScript and RxJS requirements.

If an essential dependency is not ready, you have several options: temporarily stay on a supported version, update or replace the dependency, or isolate the work needed to unblock the upgrade. The choice depends on its role in the application and the time available.

Do not choose a target just because its version number is higher. The result you need is a maintainable application whose critical user journeys still work.

### What happened on a client project: Angular 14 to 15, then 16

On a client project, I was handling the upgrade from Angular 14 to 15. Our design system was maintained by another team. Without enough time and resources to finish the Material migration, they had kept the legacy components.

To stay compatible with that dependency and move our application forward, I had to switch the project's Material imports to legacy. We kept that arrangement for several months.

About six months later, when upgrading from Angular 15 to 16, the design system had completed its migration. I then had to update the imports again, remove the legacy usage and check that the components still displayed correctly throughout the application. Part of the work had been done twice.

The technical context fits that transition: Angular Material 15 made the MDC-based components stable, with changes to their HTML structure and styling. The old implementations remained available through legacy imports, as described in the [official Angular 15 announcement](https://blog.angular.dev/angular-v15-is-now-available-df7be7f2f4c8). Removing legacy during our Angular 16 upgrade was our project's timeline, not a general requirement imposed by that release.

The imports were only part of the work. I also had to revisit screens, find the small dialogs that are rarely opened, check how they displayed and look for regressions across browsers.

The work took me several weeks. I was also getting familiar with an application I did not yet know well, so that duration included the upgrade, verification and learning the project. It is not a baseline for every migration.

That is what I take into an estimate: the technical upgrade, coordination with dependencies, visual verification and regression fixes. A passing build does not cover all of that work.

## Break the upgrade into verifiable steps

Start with a short list:

1. The current and target versions.
2. The dependencies that need to change.
3. User journeys to protect: sign-in, search, forms or payments, if the application has them.
4. Available tests and missing manual checks.

Then use Angular's update guide for your starting and target versions. Work through major releases one at a time. After each step, verify the build and affected user journeys before continuing. Compilation alone does not demonstrate that the application works for its users.

The first estimate can therefore be a short diagnostic. Its purpose is to identify unknowns before promising a one-day upgrade.

## If you cannot upgrade immediately

First identify why: lack of time, a blocking dependency or missing tests. Then choose a next action that actually reduces risk: check a library, prepare a test environment or cover the most important user journey.

If your version is still supported, schedule a window before support ends. If it is not, make that risk explicit and prioritize the work with the responsible team. The fact that the site still works does not remove the risk.

A useful deliverable fits on one page: current version, proposed target, deadline, blockers and checks to perform. That gives you a concrete basis for organizing the next steps.
To put these choices in a professional context, see the [Angular career guide](/en/career/guide) and our analysis of the [Angular frontend and fullstack job market](/en/blog/angular-frontend-fullstack-market-2026).

## Sources and verification date

Checked on 2 November 2026. Angular's announced dates can change; recheck the schedule when planning an upgrade. The priorities suggested here are practical guidance, not a universal timetable.

- [Angular versions and support policy](https://angular.dev/reference/releases)
- [Node.js, TypeScript and RxJS compatibility](https://angular.dev/reference/versions)
- [Angular update guide](https://angular.dev/update-guide)
