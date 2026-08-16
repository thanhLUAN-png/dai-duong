# Graph Report - .  (2026-08-12)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 123 nodes · 158 edges · 24 communities (15 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f567b7a7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- OceanDbContext
- http
- WebApplication1.Models
- .Login
- HomeController
- AdminController
- StudioController
- WebApplication1.csproj
- site.js
- IEnumerable<WebApplication1.Models.CreatureTemplate>
- Login.cshtml
- Register.cshtml
- Admin/Index.cshtml
- Ocean/Index.cshtml
- Color.cshtml
- MyArt.cshtml
- _ViewImports.cshtml
- ocean-immersive.js

## God Nodes (most connected - your core abstractions)
1. `WebApplication1.Models` - 9 edges
2. `OceanDbContext` - 8 edges
3. `WebApplication1.Data` - 7 edges
4. `ArtworkSubmission` - 6 edges
5. `User` - 6 edges
6. `AccountController` - 6 edges
7. `HomeController` - 6 edges
8. `AdminController` - 6 edges
9. `StudioController` - 6 edges
10. `http` - 6 edges

## Surprising Connections (you probably didn't know these)
- `HomeController` --references--> `OceanDbContext`  [EXTRACTED]
  Controllers/HomeController.cs → Data/OceanDbContext.cs
- `OceanDbContext` --references--> `ArtworkSubmission`  [EXTRACTED]
  Data/OceanDbContext.cs → Models/ArtworkSubmission.cs
- `OceanDbContext` --references--> `CreatureTemplate`  [EXTRACTED]
  Data/OceanDbContext.cs → Models/CreatureTemplate.cs
- `OceanDbContext` --references--> `User`  [EXTRACTED]
  Data/OceanDbContext.cs → Models/User.cs
- `AdminDashboardViewModel` --references--> `ArtworkSubmission`  [EXTRACTED]
  ViewModels/AdminDashboardViewModel.cs → Models/ArtworkSubmission.cs

## Import Cycles
- None detected.

## Communities (24 total, 9 thin omitted)

### Community 0 - "OceanDbContext"
Cohesion: 0.13
Nodes (13): OceanDbContext, DbContext, DbSet, ICollection, List, ModelBuilder, DateTime, ArtworkSubmission (+5 more)

### Community 1 - "http"
Cohesion: 0.13
Nodes (15): ASPNETCORE_ENVIRONMENT, applicationUrl, commandName, dotnetRunMessages, environmentVariables, launchBrowser, applicationUrl, commandName (+7 more)

### Community 2 - "WebApplication1.Models"
Cohesion: 0.24
Nodes (5): WebApplication1.Data, WebApplication1.ViewModels, WebApplication1.Models, WebApplication1.Controllers, ErrorViewModel

### Community 3 - ".Login"
Cohesion: 0.32
Nodes (8): HttpPost, IActionResult, Task, ValidateAntiForgeryToken, AccountController, HttpGet, LoginViewModel, RegisterViewModel

### Community 4 - "HomeController"
Cohesion: 0.22
Nodes (7): Controller, IActionResult, HomeController, IActionResult, Task, OceanController, ResponseCache

### Community 5 - "AdminController"
Cohesion: 0.50
Nodes (5): HttpPost, IActionResult, Task, ValidateAntiForgeryToken, AdminController

### Community 6 - "StudioController"
Cohesion: 0.39
Nodes (5): HttpPost, IActionResult, Task, ValidateAntiForgeryToken, StudioController

### Community 7 - "WebApplication1.csproj"
Cohesion: 0.33
Nodes (5): net10.0, Microsoft.EntityFrameworkCore (10.0.10), Microsoft.EntityFrameworkCore.SqlServer (10.0.10), Microsoft.EntityFrameworkCore.Tools (10.0.10), Microsoft.NET.Sdk.Web

### Community 8 - "site.js"
Cohesion: 0.50
Nodes (3): canvas, creatureGrid, naturalOcean

## Knowledge Gaps
- **27 isolated node(s):** `ErrorViewModel`, `applicationUrl`, `commandName`, `dotnetRunMessages`, `launchBrowser` (+22 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `HomeController` connect `HomeController` to `OceanDbContext`, `WebApplication1.Models`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Why does `StudioController` connect `StudioController` to `WebApplication1.Models`, `HomeController`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `OceanDbContext` connect `OceanDbContext` to `WebApplication1.Models`, `HomeController`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **What connects `ErrorViewModel`, `applicationUrl`, `commandName` to the rest of the system?**
  _27 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `OceanDbContext` be split into smaller, more focused modules?**
  _Cohesion score 0.1323529411764706 - nodes in this community are weakly interconnected._
- **Should `http` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._