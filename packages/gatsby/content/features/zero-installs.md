---
category: features
path: /features/zero-installs
title: 'Zero-Installs'
description: An overview of Yarn's Zero-Installs, a feature provided by PnP which enables storing all dependencies inside the project's repository.
---

While not a feature in itself, the term "Zero Install" encompasses a lot of Yarn features tailored around one specific goal - to make your projects as stable and fast as possible by removing the main source of entropy from the equation: Yarn itself.

> **Important:** Zero-install is an *optional* philosophy. It has some drawbacks, and while we believe this workflow to be a defining feature for professional-grade projects we don't have any plans to ignore or deprecate the typical `yarn install` workflow in any way, now or in the future.

```toc
# This code block gets replaced with the Table of Contents
```

## How does Yarn impact a project's stability?

Yarn does its best to guarantee that running `yarn install` twice will give you the same result in both cases. The main way it does this is through a lockfile, which contains all the information needed for a project to be installed in a reproducible way across systems. But is it good enough?

While Yarn does its best to guarantee that what works now will keep working, there's always the off chance that a future Yarn release will introduce a bug that will prevent you from installing your project. Or maybe your production environments will change and `yarn install` won't be able to write in the temporary directories anymore. Or maybe the network will fail and your packages won't be available anymore. Or maybe your credentials will rotate and you will start getting authentication issues. Or ... so many things can go wrong, and not all of them are things we can control.

Note that these challenges are not unique to Yarn — you may remember a time when npm used to erase production servers due to a bug that reached one of their releases. This is exactly what we mean: any code that runs is code that can fail. And thanks to Murphy's law, we know that something that can fail *will* eventually fail. From there, it becomes clear that the only sure way to prevent such issues is to run as little code as possible.

## How do you reach this "zero-install" state you're advocating for?

In order to make a project zero-install, you must be able to use it as soon as you clone it. This is very easy starting from Yarn 2!

- First, check that you are using Yarn 2 or later using `yarn --version`. You can change the version with [`yarn set version <version>`](/cli/set/version/)

- Next, ensure that your project is using [Plug'n'Play](/features/pnp) to resolve dependencies via the cache folder and **not** from `node_modules`.

  - While in theory you could check-in your `node_modules` folder rather than the cache, in practice the `node_modules` contains a gigantic amount of files that frequently change location and mess with Git's optimizations. By contrast, the Yarn cache contains exactly one file per package, that only change when the packages themselves change.

- The cache folder is by default stored within your project folder (in `.yarn/cache`). Just make sure you add it to your repository (see also, [Offline Cache](/features/offline-cache)).

  - Again, this whole workflow is optional. If at some point you decide that in the end you prefer to keep using a global cache, just toggle on `enableGlobalCache` in the [yarnrc settings](/configuration/yarnrc#enableGlobalCache) and it'll be back to normal.

- When running `yarn install`, Yarn will generate a `.pnp.cjs` file. Add it to your repository as well - it contains the dependency tree that Node will use to load your packages.

- Depending on whether your dependencies have install scripts or not (we advise you to avoid it if you can, and prefer wasm-powered alternatives) you may also want to add the `.yarn/unplugged` entries.

And that's it! Push your changes to your repository, checkout a new one somewhere, and check whether running `yarn start` (or whatever other script you'd normally use) works.

## Concerns

### Is it different from just checking-in the `node_modules` folder?

Yes, very much. To give you an idea, a `node_modules` folder of 135k uncompressed files (for a total of 1.2GB) gives a Yarn cache of 2k binary archives (for a total of 139MB). Git simply cannot support the former, while the latter is perfectly fine.

Another huge difference is the number of changes. Back in Yarn 1, when updating a package, a huge amount of files had to be recreated, or even simply moved. When the same happens in a Yarn 2 install, you get a very predictable result: exactly one changed file for each added/removed package. This in turn has beneficial side effects in terms of performance and security, since you can easily spot the invalid checksums on a per-package basis.

### What does this do to my repository size?

Every time you update a dependency and commit it, the repository will grow, the git history now containing both the new and old versions. This may lead to larger repository sizes, which makes it slower to clone a repository. Still, thanks to Git being fairly efficient at cloning large repositories, and clones being called far less than installs, the tradeoff isn't as damaging as it may seem. In case you still want to mitigate any potential problems, some mitigations are possible:

- [Partial clones](https://docs.gitlab.com/ee/topics/git/partial_clone.html) let you define a set of files that Git will only fetch when required. For instance, by running `git clone --filter=blob:limit=2m`, no outdated file larger than 2MB will be downloaded.

    - Git will lazily download the missing files as needed. For example, if you run `git checkout` on an old commit, Git will fetch whatever files are needed before the command returns, so you won't see any difference.

    - **This feature is supported by both GitHub and Gitlab, and is probably the best option at your disposal** if you can modify the way `git clone` is performed.

- [Sparse checkouts](https://github.blog/2020-01-17-bring-your-monorepo-down-to-size-with-sparse-checkout/) are the older cousin of partial clones. Instead of retrieving the whole Git history but putting aside the binary data, sparse checkouts instead define a cutoff commit which Git will treat as having no parents.

    - Because sparse checkouts only let you see a slice of the history, some commands like `git log` or `git blame` may return truncated results.

- Branches can be [filtered](https://stackoverflow.com/questions/10067848/remove-folder-and-its-contents-from-git-githubs-history) every couple of years, to remove the cache folder from the history. In case you have audit requirements, you can fork your own repository to a secondary one to make sure the old commits are archived.

- [Git LFS](https://git-lfs.github.com/) is an extension allowing Git to store large files as small pointers, which Git will then dynamically convert into the real file content during clones by downloading them from an external server.

    - While GitLab offers Git LFS storage for free, GitHub is limited to 1GB of storage and bandwidth.

### Does it have security implications?

Note that, by design, this setup requires that you trust people modifying your repository. In particular, projects accepting PRs from external users will have to be careful that the PRs affecting the package archives are legit (since it would otherwise be possible to a malicious user to send a PR for a new dependency after having altered its archive content). The best way to do this is to add a CI step (for untrusted PRs only) that uses the `--check-cache` flag:

```
$> yarn install --check-cache
```

This way Yarn will re-download the package files from whatever their remote location would be and will report any mismatching checksum.
