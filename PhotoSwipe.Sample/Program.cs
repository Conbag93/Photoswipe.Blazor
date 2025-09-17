using PhotoSwipe.Blazor.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Enable static web assets for development (RCL assets)
if (builder.Environment.IsDevelopment())
{
    builder.WebHost.UseStaticWebAssets();
}

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

// Add PhotoSwipe services
builder.Services.AddPhotoSwipe();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();


app.UseAntiforgery();

app.MapStaticAssets();
app.MapRazorComponents<PhotoSwipe.Sample.App>()
    .AddInteractiveServerRenderMode()
    .AddAdditionalAssemblies(typeof(PhotoSwipe.Blazor._Imports).Assembly, typeof(PhotoSwipe.Demos.Components._Imports).Assembly);

app.Run();
