# Contributing to PhotoSwipe.Blazor

Thank you for your interest in contributing to PhotoSwipe.Blazor! This document provides guidelines for contributing to the project.

## Development Setup

### Prerequisites
- .NET 9.0 SDK
- Node.js 20.x or later
- Git

### Getting Started
1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/Photoswipe.Blazor.git`
3. Navigate to the project directory: `cd Photoswipe.Blazor`
4. Install dependencies:
   ```bash
   cd PhotoSwipe.Blazor
   npm install
   npm run build
   ```
5. Build the solution: `dotnet build`

## Conventional Commits

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for automated versioning and changelog generation. Please follow these commit message formats:

### Commit Types

- **feat**: A new feature (triggers minor version bump)
- **fix**: A bug fix (triggers patch version bump)
- **perf**: A performance improvement (triggers patch version bump)
- **refactor**: Code refactoring without functional changes (triggers patch version bump)
- **docs**: Documentation changes (no version bump)
- **test**: Adding or updating tests (no version bump)
- **build**: Changes to build system or dependencies (no version bump)
- **ci**: Changes to CI/CD configuration (no version bump)
- **chore**: Maintenance tasks (no version bump)
- **style**: Code style changes (formatting, semicolons, etc.) (no version bump)

### Breaking Changes

For breaking changes, add `!` after the type or include `BREAKING CHANGE:` in the footer:

```
feat!: remove deprecated PhotoSwipeOptions.autoplay property

BREAKING CHANGE: The autoplay property has been removed. Use the new autoplaySettings object instead.
```

### Examples

#### Good Commit Messages
```
feat: add drag and drop upload support to PhotoSwipeUploadGallery
fix: resolve memory leak in PhotoSwipe disposal
docs: update installation instructions in README
test: add unit tests for ImageProcessingService
refactor: extract overlay positioning logic into separate service
perf: optimize image loading performance in gallery component
```

#### Bad Commit Messages
```
✗ Update stuff
✗ Fix bug
✗ WIP
✗ Add feature
✗ Changes
```

### Commit Message Structure

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Examples with Scope
```
feat(upload): add image compression options
fix(gallery): resolve thumbnail alignment issues
docs(readme): add usage examples for overlay controls
```

## Development Workflow

### 1. Create a Feature Branch
```bash
git checkout -b feat/your-feature-name
```

### 2. Make Changes
- Follow the existing code style and patterns
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes
```bash
# Build the library
cd PhotoSwipe.Blazor
npm run build
dotnet build

# Run demo applications to test
cd ../PhotoSwipe.Sample
dotnet watch --urls http://localhost:5224

# In another terminal
cd ../PhotoSwipe.Wasm.GitHub
dotnet watch --urls http://localhost:5225

# Run end-to-end tests
cd ../tests
npm install
npm test
```

### 4. Commit Your Changes
Use conventional commit messages as described above:
```bash
git add .
git commit -m "feat: add new gallery layout algorithm"
```

### 5. Push and Create Pull Request
```bash
git push origin feat/your-feature-name
```

Then create a pull request on GitHub.

## Code Style Guidelines

### C# Code Style
- Follow Microsoft's C# coding conventions
- Use meaningful variable and method names
- Add XML documentation comments for public APIs
- Implement `IAsyncDisposable` for components that use JavaScript interop

### JavaScript Code Style
- Use ES6+ syntax
- Follow existing patterns in `photoswipe-simple.js`
- Add JSDoc comments for functions

### CSS/SCSS Style
- Use CSS isolation (`.razor.css` files)
- Follow BEM methodology for class naming
- Use CSS custom properties for theming

## Testing

### Unit Tests
- Add unit tests for new services and utilities
- Place tests in appropriate test projects

### End-to-End Tests
- Add Playwright tests for new UI functionality
- Test both Blazor Server and WebAssembly hosting models
- Follow the existing page object pattern

### Test Categories
- **Setup Tests**: Basic application loading and navigation
- **Base Tests**: Core PhotoSwipe wrapper functionality
- **Extension Tests**: Advanced features (upload, selection, etc.)
- **Integration Tests**: Cross-feature interactions

## Documentation

### Code Documentation
- Add XML documentation comments for public APIs
- Include usage examples in documentation comments
- Update CLAUDE.md for development guidance

### User Documentation
- Update README.md for new features
- Add examples to demo applications
- Update component documentation

## Release Process

Releases are automated using GitHub Actions and conventional commits:

1. **Automatic Versioning**: Based on commit messages using [Versionize](https://github.com/versionize/versionize)
   - `feat:` → Minor version bump (1.0.0 → 1.1.0)
   - `fix:` → Patch version bump (1.0.0 → 1.0.1)
   - `feat!:` or `BREAKING CHANGE:` → Major version bump (1.0.0 → 2.0.0)

2. **Automated Publishing**: Packages are published to both GitHub Packages and NuGet.org

3. **Changelog Generation**: Automatically generated from conventional commits

## Getting Help

- Check existing [issues](https://github.com/conbag93/Photoswipe.Blazor/issues)
- Create a new issue for bugs or feature requests
- Join discussions in [GitHub Discussions](https://github.com/conbag93/Photoswipe.Blazor/discussions)

## Code of Conduct

Please be respectful and inclusive in all interactions. We aim to create a welcoming environment for all contributors.

Thank you for contributing to PhotoSwipe.Blazor! 🎉