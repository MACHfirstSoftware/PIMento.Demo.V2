# PIMento.Demo.V2

Modernized ASP.NET Core MVC application for PIMento vehicle demo workflows.

## Prerequisites

- .NET SDK 8.0+

## Configuration

Set required secrets via environment variables (recommended):

- EBIZ_CLIENT_ID
- EBIZ_CLIENT_SECRET
- PAYMENTS_API_KEY
- SENDGRID_API_KEY
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN

You can also populate matching keys in appsettings.Development.json for local-only use.

## Run

From repository root:

```powershell
dotnet restore
dotnet build
dotnet run --project PHXCOM.VehiclesDemo.Web
```

## Test

```powershell
dotnet test
```
