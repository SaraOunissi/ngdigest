---
title: "Which Angular version should you use for your project (and when to upgrade)?"
slug: "which-angular-version-to-use-support-2026"
description: "Angular 20 loses all support on November 28, 2026. How to choose your version based on support and dependencies, with lessons from a real upgrade."
date: "2026-11-04"
author: "Sara Ounissi"
tags: ["angular", "migration", "tech-watch"]
lang: "en"
alternate: "quelle-version-angular-utiliser-support-2026"
highlight: { value: "11/28/2026", label: "end of all support for Angular 20" }
---

I've never been very good at keeping up with Angular news. New features used to land on me during upgrades, never before. And "how long is my version still supported?" was exactly the kind of question I discovered at the same time as everything else.

In 2026, it's worth asking it a bit earlier. Since Angular 22, there is only one major version per year, each version is covered for 24 months, and Angular 20 loses all support on November 28.

In this article, I give you my short answer depending on the version you run in production, what "active support" and "LTS" really mean, what to check before upgrading, and what I learned from an upgrade where the design system couldn't keep up.

## The short answer

It depends on what you already have in production. Here is how I see it today:

- **You're starting a project** → go with the latest stable version, Angular 22. Just check first that the libraries you need support it.
- **You're on Angular 21** → no rush. Your version is covered until June 2027, you have time to prepare the next step calmly.
- **You're on Angular 20** → now you need to move. Support ends on **November 28, 2026**.
- **You're on an older version** → before estimating anything, start with an inventory: dependencies, upgrade steps, screens you absolutely can't break.

:::keyfigures The three dates to remember (checked on November 2, 2026)
- bad | 11/28/2026 | end of all support for **Angular 20**
- gold | June 2027 | end of LTS for **Angular 21**
- good | June 2028 | end of LTS for **Angular 22**, the current version
:::

To find out where your own version stands, I built a small tool: [Is my Angular version still supported?](/en/tools/angular-version-support). You pick your version, it gives you its status, the days left and the upgrade steps up to the latest one.

## Active support, LTS, end of support: what it actually means

A version can be "supported" without getting new features. There are three states:

- **Active support**: the version gets new features and regular fixes.
- **LTS**: no more features, only critical and security fixes.
- **End of support**: nothing at all anymore, even if a security flaw is found.

:::note End of support doesn't mean your app stops working
On November 29, your Angular 20 application will run exactly as it did the day before. What changes is that nobody will fix anything on it anymore. It's a risk, not an outage.
:::

Since Angular 22, the team ships one major version per year, and each version is covered for 24 months: 12 months of active support, then 12 months of LTS. Dates can move, so I'd still recommend checking [angular.dev](https://angular.dev/reference/releases) again when you plan your upgrade.

## Before choosing your target, look at your dependencies

I'll be blunt: the Angular version is rarely what blocks you. It's the libraries around it. A component library, a rich text editor, an in-house tool maintained by another team… It only takes one that doesn't keep up for your whole upgrade to slip.

So before setting a date, I check:

- the Angular versions supported by each important dependency;
- the [Node.js, TypeScript and RxJS compatibility](https://angular.dev/reference/versions) of the target version.

If an essential dependency doesn't keep up yet, you roughly have three options: stay a little longer on a version that's still supported, update or replace the library, or isolate the work that unblocks the upgrade. It depends on how big a role it plays in your app and how much time you have.

And above all, don't pick a version just because the number is higher. The goal is a maintainable app that keeps working.

## What happened to me on a project: Angular 14 to 15, then 16

At a client, I handled the upgrade from Angular 14 to 15. The design system we used was maintained by another team, which had to follow Angular upgrades on its side.

Except they didn't have enough time or people to do that upgrade properly. They did move to 15, but the whole Material part stayed on legacy. That was exactly where most of the changes were: with Angular Material 15, components move to MDC, with a different HTML structure and styles, and the old versions remain available through legacy imports ([official Angular 15 announcement](https://blog.angular.dev/angular-v15-is-now-available-df7be7f2f4c8)).

The result: to fit their project, I had to switch every Material import in our app to legacy. And we carried that around for several months.

About six months later, we moved from 15 to 16. This time, the design system had done its upgrade properly. So I had to remove everything by hand, in the other direction. It wasn't the end of the world, but it was really tedious: part of the work was done twice, and we had to make sure it was clean everywhere.

:::warn A green build doesn't mean your app works
Technically, an upgrade is sometimes not that complicated. But on the front end, you still have to go through every screen, hunt down the little hidden modals nobody ever opens, check they display correctly, and test on the different browsers. Especially when the upgrade touches the whole visual layer, like Material here.
:::

In total, this upgrade took me several weeks. To be honest, I was also discovering the project at the same time: there was the upgrade, but also getting to know the app. So it's not a duration to apply to every upgrade.

What I take from it for estimates: we often estimate the technical upgrade, but not always the testing, the visual QA and the regression fixes. And that's often where the time goes.

## How I break down an upgrade

To estimate the work, I start from a short list:

1. The current version and the target version.
2. The dependencies that need to move.
3. The screens and flows you absolutely can't break: login, search, forms, payment if there is one.
4. The tests that exist, and the checks to do by hand.

Then I use the [official update guide](https://angular.dev/update-guide) for each version jump, and I move one major version at a time. After each step, I check the build and the affected flows before moving to the next one.

If someone asks you for an upgrade "in one day", start with a small assessment instead. Its job is to surface the unknowns before you promise a date.

## What if you can't upgrade right away?

It happens, and it's not a problem in itself. What matters is knowing why: no time, a blocking dependency, no tests? Then pick one next action that really reduces the risk: check a library, set up a test environment, or cover the most important flow.

If your version is still supported, book a slot before the end date. If it isn't anymore, say it clearly to your team or your client. The site still running doesn't make the risk go away.

Personally, I sum it all up on one page: current version, target, deadline, what's blocking, and what needs checking. It's simple, but it's enough for everyone to make the same decision.

:::cta Is your version still supported? | Status, days left and your upgrade path in 10 seconds. | Check my version | /en/tools/angular-version-support
:::

To put all this in the context of your career, you can also read the [Angular career guide](/en/career/guide) and my analysis of the [Angular front-end and full-stack market](/en/blog/angular-frontend-fullstack-market-2026).

---

**Sources** (checked on November 2, 2026; dates announced by Angular may change):

- [Angular versions and support policy](https://angular.dev/reference/releases)
- [Node.js, TypeScript and RxJS compatibility](https://angular.dev/reference/versions)
- [Angular update guide](https://angular.dev/update-guide)
- [Official Angular 15 announcement](https://blog.angular.dev/angular-v15-is-now-available-df7be7f2f4c8)
