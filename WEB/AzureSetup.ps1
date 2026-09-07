#Requires -Version 5.1
#Requires -Modules Az.Accounts
#Requires -Modules Az.Resources
#Requires -Modules Az.KeyVault
#Requires -Modules Az.Storage
#Requires -Modules Az.Websites

<#
.SYNOPSIS
Creates the initial Azure resources and Key Vault configuration for the application.

.DESCRIPTION
Creates or reuses a resource group, an RBAC-enabled Key Vault, a software-protected
data-protection key, application secrets, a Standard LRS StorageV2 account with a
Cool access tier, two private blob containers, and a contained SQL database user
that is added to db_owner in the specified database. It also enables the App
Service's system-assigned managed identity and grants its required data-plane roles.
Two purpose-specific OpenIddict certificates are created in Key Vault, linked to
App Service, and configured for automatic renewal and loading by stable subject.

The script is safe to rerun. Input-derived secrets are only updated when their
values change. The generated application SQL password is retained once created,
and Key Vault manages the OpenIddict certificate lifecycle.

.NOTES
The signed-in identity must be able to create resources and role assignments.
Typically this means Owner, or Contributor together with User Access Administrator,
at the target scope.

The SQL server and database must already exist and be reachable from the computer
running this script. The SQL administrator must be allowed to create and alter users.
The App Service must already exist in the target resource group and South Africa North.

On Windows, the script first asks for an app/site name. Settings are stored in a
matching <app-site-name>.clixml file beside this script. Existing profile names are
listed before prompting so they can be selected and reused. Secure strings are
encrypted with DPAPI and can only be reopened by the same Windows user on the same
computer. Use -DoNotSaveSettings to disable saving updates.
#>

[CmdletBinding()]
param(
    [Parameter()]
    [ValidateNotNullOrEmpty()]
    [string]$ResourceGroupName,

    [Parameter()]
    [ValidateNotNullOrEmpty()]
    [string]$AppServiceName,

    [Parameter()]
    [ValidatePattern('^[A-Za-z][A-Za-z0-9-]{1,22}[A-Za-z0-9]$')]
    [string]$KeyVaultName,

    [Parameter()]
    [ValidatePattern('^[a-z0-9]{3,24}$')]
    [string]$StorageAccountName,

    [Parameter()]
    [ValidateNotNullOrEmpty()]
    [string]$SqlServerName,

    [Parameter()]
    [ValidateNotNullOrEmpty()]
    [string]$SqlDatabaseName,

    [Parameter()]
    [ValidateLength(1, 128)]
    [ValidateNotNullOrEmpty()]
    [string]$SqlAdministratorUserName,

    [Parameter()]
    [ValidateNotNull()]
    [securestring]$SqlAdministratorPassword,

    [Parameter()]
    [ValidateLength(1, 128)]
    [ValidateNotNullOrEmpty()]
    [string]$SqlUserName,

    [Parameter()]
    [ValidateNotNullOrEmpty()]
    [string]$EmailUserName,

    [Parameter()]
    [ValidateNotNull()]
    [securestring]$EmailPassword,

    # Optional safety selector. If omitted, the current Azure subscription is used.
    [Parameter()]
    [string]$SubscriptionId,

    # Optional for service-principal execution or if signed-in-user discovery is unavailable.
    [Parameter()]
    [string]$KeyVaultAdministratorObjectId,

    # Optional profile name. If omitted, the script lists existing profiles and prompts first.
    [Parameter()]
    [string]$AppSiteName,

    # Optional advanced override. By default settings are stored beside this script as <AppSiteName>.clixml.
    [Parameter()]
    [string]$SettingsPath,

    # Prevents updated inputs from being written to SettingsPath.
    [Parameter()]
    [switch]$DoNotSaveSettings
)

$profileDirectory = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($profileDirectory)) {
    $profileDirectory = (Get-Location).Path
}

if ([string]::IsNullOrWhiteSpace($AppSiteName)) {
    $existingProfiles = @(
        Get-ChildItem -LiteralPath $profileDirectory -Filter '*.clixml' -File -ErrorAction SilentlyContinue |
            Sort-Object Name
    )

    if ($existingProfiles.Count -gt 0) {
        Write-Host 'Existing app/site profiles:'
        foreach ($profile in $existingProfiles) {
            Write-Host "  $($profile.BaseName)"
        }
    }
    else {
        Write-Host 'No existing app/site profiles found.'
    }

    Write-Host ''
    while ([string]::IsNullOrWhiteSpace($AppSiteName)) {
        $AppSiteName = Read-Host -Prompt 'App/site name'
    }
}

$invalidFileNameChars = [System.IO.Path]::GetInvalidFileNameChars()
if ($AppSiteName.IndexOfAny($invalidFileNameChars) -ge 0 -or $AppSiteName -in @('.', '..')) {
    throw "The app/site name '$AppSiteName' cannot be used as a settings filename."
}

if ([string]::IsNullOrWhiteSpace($SettingsPath)) {
    $SettingsPath = Join-Path $profileDirectory "$AppSiteName.clixml"
}

Write-Host "Using app/site profile '$AppSiteName'."

$savedSettingNames = @(
    'ResourceGroupName',
    'AppServiceName',
    'KeyVaultName',
    'StorageAccountName',
    'SqlServerName',
    'SqlDatabaseName',
    'SqlAdministratorUserName',
    'SqlAdministratorPassword',
    'SqlUserName',
    'EmailUserName',
    'EmailPassword',
    'SubscriptionId',
    'KeyVaultAdministratorObjectId'
)

if (Test-Path -LiteralPath $SettingsPath -PathType Leaf) {
    try {
        $savedSettings = Import-Clixml -LiteralPath $SettingsPath -ErrorAction Stop
        foreach ($settingName in $savedSettingNames) {
            if (-not $PSBoundParameters.ContainsKey($settingName)) {
                $savedProperty = $savedSettings.PSObject.Properties[$settingName]
                if ($null -ne $savedProperty) {
                    Set-Variable -Name $settingName -Value $savedProperty.Value
                }
            }
        }

        Write-Host "Loaded saved deployment settings from '$SettingsPath'."
    }
    catch {
        throw "Could not load saved deployment settings from '$SettingsPath'. The file must be opened by the same Windows user on the same computer that created it. $($_.Exception.Message)"
    }
}
else {
    Write-Host "No saved settings found for '$AppSiteName'. A new profile will be created."
}

$requiredTextSettings = @(
    @{ Name = 'ResourceGroupName'; Prompt = 'Resource group name' },
    @{ Name = 'AppServiceName'; Prompt = 'App Service name' },
    @{ Name = 'KeyVaultName'; Prompt = 'Key Vault name' },
    @{ Name = 'StorageAccountName'; Prompt = 'Storage account name' },
    @{ Name = 'SqlServerName'; Prompt = 'SQL server name (without .database.windows.net)' },
    @{ Name = 'SqlDatabaseName'; Prompt = 'SQL database name' },
    @{ Name = 'SqlAdministratorUserName'; Prompt = 'SQL administrator username' },
    @{ Name = 'SqlUserName'; Prompt = 'Application SQL username' },
    @{ Name = 'EmailUserName'; Prompt = 'Email username' }
)

foreach ($requiredSetting in $requiredTextSettings) {
    $settingValue = Get-Variable -Name $requiredSetting.Name -ValueOnly
    while ([string]::IsNullOrWhiteSpace($settingValue)) {
        $settingValue = Read-Host -Prompt $requiredSetting.Prompt
    }

    Set-Variable -Name $requiredSetting.Name -Value $settingValue
}

if ($null -eq $SqlAdministratorPassword) {
    $SqlAdministratorPassword = Read-Host -Prompt 'SQL administrator password' -AsSecureString
}

if ($null -eq $EmailPassword) {
    $EmailPassword = Read-Host -Prompt 'Email password' -AsSecureString
}

if ($KeyVaultName -notmatch '^[A-Za-z][A-Za-z0-9-]{1,22}[A-Za-z0-9]$' -or $KeyVaultName -match '--') {
    throw 'The Key Vault name must be 3-24 characters, start with a letter, end with a letter or digit, contain only letters, digits and hyphens, and not contain consecutive hyphens.'
}

if ($StorageAccountName -notmatch '^[a-z0-9]{3,24}$') {
    throw 'The storage account name must be 3-24 characters and contain only lowercase letters and digits.'
}

if ($SqlAdministratorUserName.Length -gt 128 -or $SqlUserName.Length -gt 128) {
    throw 'SQL usernames cannot be longer than 128 characters.'
}

$sqlServerHostName = "$($SqlServerName.Trim()).database.windows.net"

$isWindowsPlatform = [System.Environment]::OSVersion.Platform -eq [System.PlatformID]::Win32NT
if (-not $DoNotSaveSettings) {
    if (-not $isWindowsPlatform) {
        Write-Warning 'Settings were not saved because CLIXML does not encrypt secure strings with DPAPI on non-Windows systems.'
    }
    else {
        $settingsDirectory = Split-Path -Parent $SettingsPath
        if (-not [string]::IsNullOrWhiteSpace($settingsDirectory)) {
            New-Item -ItemType Directory -Path $settingsDirectory -Force -ErrorAction Stop | Out-Null
        }

        $settingsToSave = [pscustomobject]@{
            ResourceGroupName                  = $ResourceGroupName
            AppServiceName                    = $AppServiceName
            KeyVaultName                      = $KeyVaultName
            StorageAccountName                = $StorageAccountName
            SqlServerName                     = $SqlServerName
            SqlDatabaseName                   = $SqlDatabaseName
            SqlAdministratorUserName          = $SqlAdministratorUserName
            SqlAdministratorPassword          = $SqlAdministratorPassword
            SqlUserName                       = $SqlUserName
            EmailUserName                     = $EmailUserName
            EmailPassword                     = $EmailPassword
            SubscriptionId                    = $SubscriptionId
            KeyVaultAdministratorObjectId     = $KeyVaultAdministratorObjectId
        }

        $settingsToSave | Export-Clixml -LiteralPath $SettingsPath -Force -ErrorAction Stop
        Write-Host "Saved deployment settings to '$SettingsPath'."
    }
}

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$location = 'southafricanorth'
$dataProtectionKeyName = 'dataprotection'
$keyVaultAdministratorRoleId = [guid]'00482a5a-887f-4fb3-b363-3b7fe8e74483'
$keyVaultCryptoUserRoleId = [guid]'12338af0-0e69-4776-bea7-57ae8d297424'
$keyVaultSecretsUserRoleId = [guid]'4633458b-17de-408a-b874-0445c86b69e6'
$keyVaultCertificateUserRoleId = [guid]'db79e9a7-68ee-4b58-9aeb-b90e7c24fcba'
$storageBlobDataContributorRoleId = [guid]'ba92f5b4-2d11-453d-a403-e96b0029c9fe'
$azureAppServiceResourceProviderApplicationId = 'abfa0a7c-a6b6-4736-8310-5855508787cd'
$webCertificateApiVersion = '2024-11-01'

function ConvertFrom-SecureStringValue {
    param(
        [Parameter(Mandatory)]
        [securestring]$SecureValue
    )

    return [System.Net.NetworkCredential]::new('', $SecureValue).Password
}

function ConvertTo-ConnectionStringValue {
    param(
        [Parameter(Mandatory)]
        [string]$Value
    )

    if ($Value -match '[;\"]' -or $Value -match '^\s|\s$') {
        return '"' + $Value.Replace('"', '""') + '"'
    }

    return $Value
}

function Set-SqlDatabaseUser {
    param(
        [Parameter(Mandatory)]
        [string]$ServerName,

        [Parameter(Mandatory)]
        [string]$DatabaseName,

        [Parameter(Mandatory)]
        [ValidateLength(1, 128)]
        [string]$AdministratorUserName,

        [Parameter(Mandatory)]
        [ValidateLength(1, 128)]
        [string]$AdministratorPassword,

        [Parameter(Mandatory)]
        [ValidateLength(1, 128)]
        [string]$DatabaseUserName,

        [Parameter(Mandatory)]
        [ValidateLength(1, 128)]
        [string]$DatabaseUserPassword
    )

    $serverHostName = $ServerName.Trim()

    $connectionString = New-Object System.Data.SqlClient.SqlConnectionStringBuilder
    $connectionString['Data Source'] = "tcp:$serverHostName,1433"
    $connectionString['Initial Catalog'] = $DatabaseName
    $connectionString['User ID'] = $AdministratorUserName
    $connectionString['Password'] = $AdministratorPassword
    $connectionString['Persist Security Info'] = $false
    $connectionString['Encrypt'] = $true
    $connectionString['TrustServerCertificate'] = $false
    $connectionString['Connect Timeout'] = 120

    $connection = [System.Data.SqlClient.SqlConnection]::new($connectionString.ConnectionString)
    $command = $null
    try {
        $connection.Open()
        $command = $connection.CreateCommand()
        $command.CommandTimeout = 120
        $command.CommandText = @'
DECLARE @QuotedUserName nvarchar(258) = QUOTENAME(@UserName);
DECLARE @QuotedPassword nvarchar(258) = QUOTENAME(@UserPassword, '''');
DECLARE @Sql nvarchar(max);

IF @QuotedUserName IS NULL OR @QuotedPassword IS NULL
    THROW 50001, 'The database username or password is too long.', 1;

IF DATABASE_PRINCIPAL_ID(@UserName) IS NULL
BEGIN
    SET @Sql = N'CREATE USER ' + @QuotedUserName + N' WITH PASSWORD = ' + @QuotedPassword + N';';
END
ELSE
BEGIN
    SET @Sql = N'ALTER USER ' + @QuotedUserName + N' WITH PASSWORD = ' + @QuotedPassword + N';';
END;

EXEC sys.sp_executesql @Sql;

IF NOT EXISTS (
    SELECT 1
    FROM sys.database_role_members AS drm
    INNER JOIN sys.database_principals AS rolePrincipal
        ON rolePrincipal.principal_id = drm.role_principal_id
    INNER JOIN sys.database_principals AS memberPrincipal
        ON memberPrincipal.principal_id = drm.member_principal_id
    WHERE rolePrincipal.name = N'db_owner'
      AND memberPrincipal.name = @UserName
)
BEGIN
    SET @Sql = N'ALTER ROLE [db_owner] ADD MEMBER ' + @QuotedUserName + N';';
    EXEC sys.sp_executesql @Sql;
END;
'@

        [void]$command.Parameters.Add('@UserName', [System.Data.SqlDbType]::NVarChar, 128)
        $command.Parameters['@UserName'].Value = $DatabaseUserName
        [void]$command.Parameters.Add('@UserPassword', [System.Data.SqlDbType]::NVarChar, 128)
        $command.Parameters['@UserPassword'].Value = $DatabaseUserPassword
        [void]$command.ExecuteNonQuery()
    }
    finally {
        if ($null -ne $command) {
            $command.Dispose()
        }

        if ($null -ne $connection) {
            $connection.Dispose()
        }

        $connectionString.Clear()
    }
}

function New-RandomAlphaNumericString {
    param(
        [Parameter(Mandatory)]
        [ValidateRange(1, 4096)]
        [int]$Length
    )

    $alphabet = [char[]]'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    $largestUnbiasedByte = [math]::Floor(256 / $alphabet.Length) * $alphabet.Length
    $random = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $buffer = New-Object byte[] 1
    $result = New-Object System.Text.StringBuilder

    try {
        while ($result.Length -lt $Length) {
            $random.GetBytes($buffer)
            if ($buffer[0] -lt $largestUnbiasedByte) {
                [void]$result.Append($alphabet[$buffer[0] % $alphabet.Length])
            }
        }

        return $result.ToString()
    }
    finally {
        $random.Dispose()
    }
}

function New-SqlDatabasePassword {
    do {
        $password = New-RandomAlphaNumericString -Length 32
    }
    until ($password -cmatch '[A-Z]' -and $password -cmatch '[a-z]' -and $password -match '[0-9]')

    return $password
}

function Invoke-WithRetry {
    param(
        [Parameter(Mandatory)]
        [scriptblock]$Action,

        [Parameter(Mandatory)]
        [string]$Operation,

        [int]$MaximumAttempts = 12,
        [int]$DelaySeconds = 5
    )

    for ($attempt = 1; $attempt -le $MaximumAttempts; $attempt++) {
        try {
            return & $Action
        }
        catch {
            if ($attempt -eq $MaximumAttempts) {
                throw "$Operation failed after $MaximumAttempts attempts. $($_.Exception.Message)"
            }

            Write-Warning "$Operation is not ready yet (attempt $attempt of $MaximumAttempts). Retrying in $DelaySeconds seconds."
            Start-Sleep -Seconds $DelaySeconds
        }
    }
}

function Grant-AzureRoleAtScope {
    param(
        [Parameter(Mandatory)]
        [string]$ObjectId,

        [Parameter(Mandatory)]
        [guid]$RoleDefinitionId,

        [Parameter(Mandatory)]
        [string]$RoleName,

        [Parameter(Mandatory)]
        [string]$Scope
    )

    $getRoleParameters = @{
        ObjectId         = $ObjectId
        RoleDefinitionId = $RoleDefinitionId
        Scope            = $Scope
        AtScope          = $true
        ErrorAction      = 'SilentlyContinue'
    }
    $existingAssignment = Get-AzRoleAssignment @getRoleParameters

    if ($null -ne $existingAssignment) {
        Write-Host "The principal already has '$RoleName' at the requested scope."
        return
    }

    Write-Host "Granting principal '$RoleName'..."
    $null = Invoke-WithRetry -Operation "Assigning Azure role '$RoleName'" -Action {
        $newRoleParameters = @{
            ObjectId                      = $ObjectId
            ObjectType                    = 'ServicePrincipal'
            RoleDefinitionId              = $RoleDefinitionId
            Scope                         = $Scope
            SkipClientSideScopeValidation = $true
            ErrorAction                   = 'Stop'
        }
        New-AzRoleAssignment @newRoleParameters | Out-Null
        return $true
    }
}

function Get-OrCreate-OpenIddictCertificate {
    param(
        [Parameter(Mandatory)]
        [string]$VaultName,

        [Parameter(Mandatory)]
        [string]$CertificateName,

        [Parameter(Mandatory)]
        [string]$SubjectName,

        [Parameter(Mandatory)]
        [System.Security.Cryptography.X509Certificates.X509KeyUsageFlags]$KeyUsage
    )

    $keyUsages = New-Object 'System.Collections.Generic.List[System.Security.Cryptography.X509Certificates.X509KeyUsageFlags]'
    $keyUsages.Add($KeyUsage)

    $policyParameters = @{
        IssuerName                = 'Self'
        SubjectName               = $SubjectName
        SecretContentType         = 'application/x-pkcs12'
        KeyType                   = 'RSA'
        KeySize                   = 4096
        KeyUsage                  = $keyUsages
        ValidityInMonths          = 24
        RenewAtPercentageLifetime = 80
    }

    $certificate = Get-AzKeyVaultCertificate -VaultName $VaultName -Name $CertificateName -ErrorAction SilentlyContinue
    if ($null -eq $certificate) {
        Write-Host "Creating auto-renewing Key Vault certificate '$CertificateName'..."
        $certificatePolicy = New-AzKeyVaultCertificatePolicy @policyParameters
        $addCertificateParameters = @{
            VaultName         = $VaultName
            Name              = $CertificateName
            CertificatePolicy = $certificatePolicy
            Tag               = @{ Purpose = 'OpenIddict' }
        }
        Add-AzKeyVaultCertificate @addCertificateParameters | Out-Null

        $certificate = Invoke-WithRetry -Operation "Waiting for Key Vault certificate '$CertificateName'" -MaximumAttempts 24 -DelaySeconds 5 -Action {
            $currentCertificate = Get-AzKeyVaultCertificate -VaultName $VaultName -Name $CertificateName -ErrorAction Stop
            if ($null -eq $currentCertificate -or [string]::IsNullOrWhiteSpace([string]$currentCertificate.Thumbprint)) {
                throw 'The certificate has not finished being issued.'
            }

            return $currentCertificate
        }
    }
    else {
        if ($certificate.Certificate.Subject -ne $SubjectName) {
            throw "Key Vault certificate '$CertificateName' has subject '$($certificate.Certificate.Subject)', not '$SubjectName'."
        }

        Write-Host "Using existing Key Vault certificate '$CertificateName' and refreshing its renewal policy..."
        $setPolicyParameters = @{
            VaultName                 = $VaultName
            Name                      = $CertificateName
            IssuerName                = 'Self'
            SubjectName               = $SubjectName
            SecretContentType         = 'application/x-pkcs12'
            KeyType                   = 'RSA'
            KeySize                   = 4096
            KeyUsage                  = $keyUsages
            ValidityInMonths          = 24
            RenewAtPercentageLifetime = 80
            ReuseKeyOnRenewal         = $false
        }
        Set-AzKeyVaultCertificatePolicy @setPolicyParameters | Out-Null
    }

    return $certificate
}

function Connect-KeyVaultCertificateToWebApp {
    param(
        [Parameter(Mandatory)]
        [string]$ResourceGroupName,

        [Parameter(Mandatory)]
        [string]$Location,

        [Parameter(Mandatory)]
        [string]$CertificateResourceName,

        [Parameter(Mandatory)]
        [string]$KeyVaultResourceId,

        [Parameter(Mandatory)]
        [string]$KeyVaultCertificateName,

        [Parameter(Mandatory)]
        [string]$ServerFarmId,

        [Parameter(Mandatory)]
        [string]$ApiVersion
    )

    $certificateProperties = @{
        keyVaultId         = $KeyVaultResourceId
        keyVaultSecretName = $KeyVaultCertificateName
        serverFarmId       = $ServerFarmId
    }

    $getResourceParameters = @{
        ResourceGroupName = $ResourceGroupName
        ResourceType      = 'Microsoft.Web/certificates'
        Name              = $CertificateResourceName
        ApiVersion        = $ApiVersion
        ErrorAction       = 'SilentlyContinue'
    }
    $existingResource = Get-AzResource @getResourceParameters

    if ($null -eq $existingResource) {
        Write-Host "Linking Key Vault certificate '$KeyVaultCertificateName' to App Service..."
        return Invoke-WithRetry -Operation "Importing App Service certificate '$CertificateResourceName'" -MaximumAttempts 12 -DelaySeconds 10 -Action {
            $newResourceParameters = @{
                ResourceGroupName = $ResourceGroupName
                ResourceType      = 'Microsoft.Web/certificates'
                ResourceName      = $CertificateResourceName
                Location          = $Location
                Properties        = $certificateProperties
                ApiVersion        = $ApiVersion
                Force             = $true
                ErrorAction       = 'Stop'
            }
            New-AzResource @newResourceParameters
        }
    }

    Write-Host "Refreshing App Service link for certificate '$KeyVaultCertificateName'..."
    $setResourceParameters = @{
        ResourceId  = $existingResource.ResourceId
        Properties  = $certificateProperties
        ApiVersion  = $ApiVersion
        Force       = $true
        ErrorAction = 'Stop'
    }
    return Invoke-WithRetry -Operation "Refreshing App Service certificate '$CertificateResourceName'" -MaximumAttempts 12 -DelaySeconds 10 -Action {
        Set-AzResource @setResourceParameters
    }
}

function Set-KeyVaultSecretIfChanged {
    param(
        [Parameter(Mandatory)]
        [string]$VaultName,

        [Parameter(Mandatory)]
        [string]$Name,

        [Parameter(Mandatory)]
        [AllowEmptyString()]
        [string]$Value
    )

    $currentValue = Get-AzKeyVaultSecret -VaultName $VaultName -Name $Name -AsPlainText -ErrorAction SilentlyContinue
    if ($null -ne $currentValue -and [string]::Equals($currentValue, $Value, [System.StringComparison]::Ordinal)) {
        Write-Host "Secret '$Name' is already current."
        return
    }

    $secureValue = ConvertTo-SecureString -String $Value -AsPlainText -Force
    Set-AzKeyVaultSecret -VaultName $VaultName -Name $Name -SecretValue $secureValue | Out-Null
    Write-Host "Secret '$Name' was created or updated."
}

function Register-ResourceProviderIfNeeded {
    param(
        [Parameter(Mandatory)]
        [string]$ProviderNamespace
    )

    $provider = Get-AzResourceProvider -ProviderNamespace $ProviderNamespace
    if ($provider.RegistrationState -eq 'Registered') {
        return
    }

    Write-Host "Registering Azure resource provider '$ProviderNamespace'..."
    Register-AzResourceProvider -ProviderNamespace $ProviderNamespace | Out-Null

    for ($attempt = 1; $attempt -le 30; $attempt++) {
        $provider = Get-AzResourceProvider -ProviderNamespace $ProviderNamespace
        if ($provider.RegistrationState -eq 'Registered') {
            return
        }

        Start-Sleep -Seconds 2
    }

    throw "Azure resource provider '$ProviderNamespace' did not finish registering."
}

# Reserved for the App Service phase that will be added later.
$null = $AppServiceName

$context = Get-AzContext
if ($null -eq $context) {
    Write-Host 'No Azure session was found. Opening Azure sign-in...'
    Connect-AzAccount | Out-Null
    $context = Get-AzContext
}

if (-not [string]::IsNullOrWhiteSpace($SubscriptionId)) {
    Set-AzContext -SubscriptionId $SubscriptionId | Out-Null
    $context = Get-AzContext
}
else {
    $SubscriptionId = $context.Subscription.Id
    if (-not $DoNotSaveSettings -and $isWindowsPlatform) {
        $settingsToSave.SubscriptionId = $SubscriptionId
        $settingsToSave | Export-Clixml -LiteralPath $SettingsPath -Force
    }
}

Write-Host "Using subscription '$($context.Subscription.Name)' ($($context.Subscription.Id))."

Register-ResourceProviderIfNeeded -ProviderNamespace 'Microsoft.KeyVault'
Register-ResourceProviderIfNeeded -ProviderNamespace 'Microsoft.Storage'

$resourceGroup = Get-AzResourceGroup -Name $ResourceGroupName -ErrorAction SilentlyContinue
if ($null -eq $resourceGroup) {
    Write-Host "Creating resource group '$ResourceGroupName' in '$location'..."
    $resourceGroup = New-AzResourceGroup -Name $ResourceGroupName -Location $location
}
else {
    Write-Host "Using existing resource group '$ResourceGroupName'."
}

$keyVault = Get-AzKeyVault -VaultName $KeyVaultName -ResourceGroupName $ResourceGroupName -ErrorAction SilentlyContinue
if ($null -eq $keyVault) {
    Write-Host "Creating Key Vault '$KeyVaultName' in '$location'..."
    $newKeyVaultParameters = @{
        Name              = $KeyVaultName
        ResourceGroupName = $ResourceGroupName
        Location          = $location
        Sku               = 'Standard'
    }
    $keyVault = New-AzKeyVault @newKeyVaultParameters
}
else {
    if ($keyVault.Location -ne $location) {
        throw "Key Vault '$KeyVaultName' already exists in '$($keyVault.Location)', not '$location'."
    }

    Write-Host "Using existing Key Vault '$KeyVaultName'."
}

# Refuse to alter an existing legacy vault's permission model because switching
# models can invalidate its existing access policies.
$keyVault = Get-AzKeyVault -VaultName $KeyVaultName -ResourceGroupName $ResourceGroupName
if ($keyVault.EnableRbacAuthorization -ne $true) {
    throw "Key Vault '$KeyVaultName' does not use Azure RBAC. Migrate it separately before running this script."
}

if ([string]::IsNullOrWhiteSpace($KeyVaultAdministratorObjectId)) {
    try {
        $KeyVaultAdministratorObjectId = (Get-AzADUser -SignedIn).Id
    }
    catch {
        throw "Could not discover the signed-in user's object ID. Pass -KeyVaultAdministratorObjectId explicitly. $($_.Exception.Message)"
    }
}

$getRoleAssignmentParameters = @{
    ObjectId         = $KeyVaultAdministratorObjectId
    RoleDefinitionId = $keyVaultAdministratorRoleId
    Scope            = $keyVault.ResourceId
    AtScope          = $true
    ErrorAction      = 'SilentlyContinue'
}
$roleAssignment = Get-AzRoleAssignment @getRoleAssignmentParameters

if ($null -eq $roleAssignment) {
    Write-Host "Granting the provisioning identity Key Vault Administrator access to '$KeyVaultName'..."
    try {
        $newRoleAssignmentParameters = @{
            ObjectId         = $KeyVaultAdministratorObjectId
            RoleDefinitionId = $keyVaultAdministratorRoleId
            Scope            = $keyVault.ResourceId
        }
        New-AzRoleAssignment @newRoleAssignmentParameters | Out-Null
    }
    catch {
        throw "Could not grant Key Vault data access. The signed-in identity needs permission to create role assignments. $($_.Exception.Message)"
    }
}

$keyList = Invoke-WithRetry -Operation "Checking access to keys in Key Vault '$KeyVaultName'" -Action {
    @(Get-AzKeyVaultKey -VaultName $KeyVaultName -ErrorAction Stop)
}

$dataProtectionKey = $keyList | Where-Object Name -eq $dataProtectionKeyName | Select-Object -First 1
if ($null -ne $dataProtectionKey) {
    $dataProtectionKey = Get-AzKeyVaultKey -VaultName $KeyVaultName -Name $dataProtectionKeyName
}

if ($null -eq $dataProtectionKey -or $null -ne $dataProtectionKey.Expires -or $dataProtectionKey.Enabled -ne $true) {
    Write-Host "Creating a non-expiring version of Key Vault key '$dataProtectionKeyName'..."
    $addKeyParameters = @{
        VaultName   = $KeyVaultName
        Name        = $dataProtectionKeyName
        Destination = 'Software'
    }
    $dataProtectionKey = Add-AzKeyVaultKey @addKeyParameters
}
else {
    Write-Host "Using existing non-expiring Key Vault key '$dataProtectionKeyName'."
}

$sqlPasswordPlainText = $null
$existingDatabaseConnectionString = Get-AzKeyVaultSecret `
    -VaultName $KeyVaultName `
    -Name 'ConnectionStrings--DefaultConnection' `
    -AsPlainText `
    -ErrorAction SilentlyContinue

if (-not [string]::IsNullOrWhiteSpace($existingDatabaseConnectionString)) {
    $existingConnectionStringBuilder = $null
    $savedSqlPassword = $null
    try {
        $existingConnectionStringBuilder = [System.Data.SqlClient.SqlConnectionStringBuilder]::new($existingDatabaseConnectionString)
        $savedSqlPassword = [string]$existingConnectionStringBuilder['Password']
        if (-not [string]::IsNullOrWhiteSpace($savedSqlPassword) -and $savedSqlPassword.Length -le 128) {
            $sqlPasswordPlainText = $savedSqlPassword
            Write-Host 'Reusing the existing application SQL password from Key Vault.'
        }
    }
    catch {
        Write-Warning 'The existing database connection-string secret could not be parsed. A new application SQL password will be generated.'
    }
    finally {
        if ($null -ne $existingConnectionStringBuilder) {
            $existingConnectionStringBuilder.Clear()
        }

        $savedSqlPassword = $null
    }
}

if ([string]::IsNullOrWhiteSpace($sqlPasswordPlainText)) {
    $sqlPasswordPlainText = New-SqlDatabasePassword
    Write-Host 'Generated a new 32-character application SQL password.'
}

$sqlAdministratorPasswordPlainText = $null
$emailPasswordPlainText = $null
try {
    $sqlAdministratorPasswordPlainText = ConvertFrom-SecureStringValue -SecureValue $SqlAdministratorPassword
    $emailPasswordPlainText = ConvertFrom-SecureStringValue -SecureValue $EmailPassword

    $sqlServerValue = ConvertTo-ConnectionStringValue -Value $sqlServerHostName
    $sqlDatabaseValue = ConvertTo-ConnectionStringValue -Value $SqlDatabaseName
    $sqlUserValue = ConvertTo-ConnectionStringValue -Value $SqlUserName
    $sqlPasswordValue = ConvertTo-ConnectionStringValue -Value $sqlPasswordPlainText

    $databaseConnectionString = "Server=tcp:$sqlServerValue,1433;Initial Catalog=$sqlDatabaseValue;Persist Security Info=False;User ID=$sqlUserValue;Password=$sqlPasswordValue;MultipleActiveResultSets=true;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

    Set-KeyVaultSecretIfChanged -VaultName $KeyVaultName -Name 'ConnectionStrings--DefaultConnection' -Value $databaseConnectionString

    Set-KeyVaultSecretIfChanged -VaultName $KeyVaultName -Name 'Settings--EmailSettings--Password' -Value $emailPasswordPlainText
    Set-KeyVaultSecretIfChanged -VaultName $KeyVaultName -Name 'Settings--EmailSettings--UserName' -Value $EmailUserName

    Write-Host "Creating or updating database user '$SqlUserName' in database '$SqlDatabaseName'..."
    Set-SqlDatabaseUser `
        -ServerName $sqlServerHostName `
        -DatabaseName $SqlDatabaseName `
        -AdministratorUserName $SqlAdministratorUserName `
        -AdministratorPassword $sqlAdministratorPasswordPlainText `
        -DatabaseUserName $SqlUserName `
        -DatabaseUserPassword $sqlPasswordPlainText
    Write-Host "Database user '$SqlUserName' is a member of db_owner in '$SqlDatabaseName'."

    $storageAccount = Get-AzStorageAccount -ResourceGroupName $ResourceGroupName -Name $StorageAccountName -ErrorAction SilentlyContinue

    if ($null -eq $storageAccount) {
        Write-Host "Creating StorageV2 account '$StorageAccountName' in '$location'..."
        $newStorageAccountParameters = @{
            ResourceGroupName     = $ResourceGroupName
            Name                  = $StorageAccountName
            Location              = $location
            SkuName               = 'Standard_LRS'
            Kind                  = 'StorageV2'
            AccessTier            = 'Cool'
            EnableHttpsTrafficOnly = $true
            MinimumTlsVersion     = 'TLS1_2'
            AllowBlobPublicAccess = $false
            AllowSharedKeyAccess  = $true
        }
        $storageAccount = New-AzStorageAccount @newStorageAccountParameters
    }
    else {
        if ($storageAccount.Location -ne $location) {
            throw "Storage account '$StorageAccountName' already exists in '$($storageAccount.Location)', not '$location'."
        }

        if ($storageAccount.Kind -ne 'StorageV2') {
            throw "Storage account '$StorageAccountName' is '$($storageAccount.Kind)', not 'StorageV2'."
        }

        if ($storageAccount.Sku.Name -ne 'Standard_LRS') {
            throw "Storage account '$StorageAccountName' uses '$($storageAccount.Sku.Name)', not 'Standard_LRS'."
        }

        if ($storageAccount.AccessTier -ne 'Cool') {
            Write-Host "Changing storage account '$StorageAccountName' to the Cool access tier..."
            $storageAccount = Set-AzStorageAccount -ResourceGroupName $ResourceGroupName -Name $StorageAccountName -AccessTier Cool
        }
        else {
            Write-Host "Using existing storage account '$StorageAccountName'."
        }
    }

    $storageContext = $storageAccount.Context
    if ([string]::IsNullOrWhiteSpace($storageContext.ConnectionString)) {
        throw "Could not obtain a shared-key connection string for storage account '$StorageAccountName'. Ensure shared-key access is enabled and the provisioning identity can list storage account keys."
    }

    foreach ($containerName in @('documents', 'dataprotection')) {
        $container = Get-AzStorageContainer -Name $containerName -Context $storageContext -ErrorAction SilentlyContinue

        if ($null -eq $container) {
            Write-Host "Creating private blob container '$containerName'..."
            New-AzStorageContainer -Name $containerName -Context $storageContext -Permission Off | Out-Null
        }
        else {
            Write-Host "Using existing blob container '$containerName'."
        }
    }

    # Containers do not have distinct connection strings. Store the account-level
    # connection string here and keep the container name in its own setting.
    Set-KeyVaultSecretIfChanged -VaultName $KeyVaultName -Name 'Settings--Azure--Documents--ConnectionString' -Value $storageContext.ConnectionString
    Set-KeyVaultSecretIfChanged -VaultName $KeyVaultName -Name 'Settings--Azure--Documents--ContainerName' -Value 'documents'

    $webApp = Get-AzWebApp -ResourceGroupName $ResourceGroupName -Name $AppServiceName -ErrorAction SilentlyContinue
    if ($null -eq $webApp) {
        throw "App Service '$AppServiceName' was not found in resource group '$ResourceGroupName'. Create the App Service before configuring its managed identity."
    }

    $normalizedWebAppLocation = ($webApp.Location -replace '\s', '').ToLowerInvariant()
    if ($normalizedWebAppLocation -ne $location) {
        throw "App Service '$AppServiceName' already exists in '$($webApp.Location)', not '$location'."
    }

    if ($null -eq $webApp.Identity -or [string]::IsNullOrWhiteSpace([string]$webApp.Identity.PrincipalId)) {
        Write-Host "Enabling the system-assigned managed identity on App Service '$AppServiceName'..."
        Set-AzWebApp -ResourceGroupName $ResourceGroupName -Name $AppServiceName -AssignIdentity $true | Out-Null

        $webApp = Invoke-WithRetry -Operation "Waiting for App Service managed identity '$AppServiceName'" -Action {
            $currentWebApp = Get-AzWebApp -ResourceGroupName $ResourceGroupName -Name $AppServiceName -ErrorAction Stop
            if ($null -eq $currentWebApp.Identity -or [string]::IsNullOrWhiteSpace([string]$currentWebApp.Identity.PrincipalId)) {
                throw 'The managed identity principal ID is not available yet.'
            }

            return $currentWebApp
        }
    }
    else {
        Write-Host "Using the existing system-assigned managed identity on App Service '$AppServiceName'."
    }

    $managedIdentityPrincipalId = [string]$webApp.Identity.PrincipalId

    Grant-AzureRoleAtScope `
        -ObjectId $managedIdentityPrincipalId `
        -RoleDefinitionId $keyVaultCryptoUserRoleId `
        -RoleName 'Key Vault Crypto User' `
        -Scope $keyVault.ResourceId

    Grant-AzureRoleAtScope `
        -ObjectId $managedIdentityPrincipalId `
        -RoleDefinitionId $keyVaultSecretsUserRoleId `
        -RoleName 'Key Vault Secrets User' `
        -Scope $keyVault.ResourceId

    Grant-AzureRoleAtScope `
        -ObjectId $managedIdentityPrincipalId `
        -RoleDefinitionId $storageBlobDataContributorRoleId `
        -RoleName 'Storage Blob Data Contributor' `
        -Scope $storageAccount.Id

    $appServiceResourceProvider = Get-AzADServicePrincipal `
        -ApplicationId $azureAppServiceResourceProviderApplicationId `
        -ErrorAction SilentlyContinue

    if ($null -eq $appServiceResourceProvider) {
        throw "The Microsoft Azure App Service resource-provider service principal was not found in this tenant. Ensure the Microsoft.Web resource provider is registered."
    }

    Grant-AzureRoleAtScope `
        -ObjectId $appServiceResourceProvider.Id `
        -RoleDefinitionId $keyVaultCertificateUserRoleId `
        -RoleName 'Key Vault Certificate User' `
        -Scope $keyVault.ResourceId

    $signingCertificateName = "$AppServiceName-openiddict-signing"
    $encryptionCertificateName = "$AppServiceName-openiddict-encryption"
    $signingCertificateSubject = "CN=$signingCertificateName"
    $encryptionCertificateSubject = "CN=$encryptionCertificateName"

    $signingCertificate = Get-OrCreate-OpenIddictCertificate `
        -VaultName $KeyVaultName `
        -CertificateName $signingCertificateName `
        -SubjectName $signingCertificateSubject `
        -KeyUsage ([System.Security.Cryptography.X509Certificates.X509KeyUsageFlags]::DigitalSignature)

    $encryptionCertificate = Get-OrCreate-OpenIddictCertificate `
        -VaultName $KeyVaultName `
        -CertificateName $encryptionCertificateName `
        -SubjectName $encryptionCertificateSubject `
        -KeyUsage ([System.Security.Cryptography.X509Certificates.X509KeyUsageFlags]::KeyEncipherment)

    if ([string]::IsNullOrWhiteSpace([string]$webApp.ServerFarmId)) {
        throw "Could not determine the App Service plan resource ID for '$AppServiceName'."
    }

    $signingAppServiceCertificate = Connect-KeyVaultCertificateToWebApp `
        -ResourceGroupName $ResourceGroupName `
        -Location $location `
        -CertificateResourceName $signingCertificateName `
        -KeyVaultResourceId $keyVault.ResourceId `
        -KeyVaultCertificateName $signingCertificateName `
        -ServerFarmId $webApp.ServerFarmId `
        -ApiVersion $webCertificateApiVersion

    $encryptionAppServiceCertificate = Connect-KeyVaultCertificateToWebApp `
        -ResourceGroupName $ResourceGroupName `
        -Location $location `
        -CertificateResourceName $encryptionCertificateName `
        -KeyVaultResourceId $keyVault.ResourceId `
        -KeyVaultCertificateName $encryptionCertificateName `
        -ServerFarmId $webApp.ServerFarmId `
        -ApiVersion $webCertificateApiVersion

    $certificateThumbprints = @(
        [string]$signingCertificate.Thumbprint,
        [string]$encryptionCertificate.Thumbprint
    )
    $websiteLoadCertificatesValue = $certificateThumbprints -join ','

    $webApp = Get-AzWebApp -ResourceGroupName $ResourceGroupName -Name $AppServiceName
    $appSettings = @{}
    if ($webApp.SiteConfig.AppSettings -is [System.Collections.IDictionary]) {
        foreach ($settingName in $webApp.SiteConfig.AppSettings.Keys) {
            $appSettings[$settingName] = $webApp.SiteConfig.AppSettings[$settingName]
        }
    }
    else {
        foreach ($setting in @($webApp.SiteConfig.AppSettings)) {
            $appSettings[$setting.Name] = $setting.Value
        }
    }

    if ($appSettings['WEBSITE_LOAD_CERTIFICATES'] -ne $websiteLoadCertificatesValue) {
        Write-Host "Configuring App Service to load the OpenIddict certificates..."
        $appSettings['WEBSITE_LOAD_CERTIFICATES'] = $websiteLoadCertificatesValue
        Set-AzWebApp `
            -ResourceGroupName $ResourceGroupName `
            -Name $AppServiceName `
            -AppSettings $appSettings | Out-Null
    }
    else {
        Write-Host 'App Service is already configured to load the OpenIddict certificates.'
    }

    Set-KeyVaultSecretIfChanged `
        -VaultName $KeyVaultName `
        -Name 'Settings--Azure--SigningCertificateSubject' `
        -Value $signingCertificateSubject

    Set-KeyVaultSecretIfChanged `
        -VaultName $KeyVaultName `
        -Name 'Settings--Azure--EncryptionCertificateSubject' `
        -Value $encryptionCertificateSubject
}
finally {
    $sqlPasswordPlainText = $null
    $sqlAdministratorPasswordPlainText = $null
    $emailPasswordPlainText = $null
    $sqlPasswordValue = $null
    $databaseConnectionString = $null
    $existingDatabaseConnectionString = $null
}

[pscustomobject]@{
    SubscriptionName            = $context.Subscription.Name
    SubscriptionId              = $context.Subscription.Id
    SettingsPath                = if ($DoNotSaveSettings) { $null } else { $SettingsPath }
    Location                    = $location
    ResourceGroupName           = $resourceGroup.ResourceGroupName
    KeyVaultName                = $keyVault.VaultName
    DataProtectionKeyIdentifier = $dataProtectionKey.Id
    StorageAccountName          = $storageAccount.StorageAccountName
    SqlDatabaseName             = $SqlDatabaseName
    SqlDatabaseUserName         = $SqlUserName
    AppServiceName              = $AppServiceName
    ManagedIdentityPrincipalId  = $managedIdentityPrincipalId
    SigningCertificateSubject   = $signingCertificateSubject
    EncryptionCertificateSubject = $encryptionCertificateSubject
    DocumentsContainerName      = 'documents'
    DataProtectionContainerName = 'dataprotection'
}
