# ติดตั้ง PnP PowerShell หากยังไม่มี: Install-Module PnP.PowerShell
# เชื่อมต่อ SharePoint Site
$siteUrl = "https://yourtenant.sharepoint.com/sites/your-site"
Connect-PnPOnline -Url $siteUrl -Interactive

# -------------------------------------------------------------
# 1. Create SDS_Catalog
# -------------------------------------------------------------
New-PnPList -Title "SDS_Catalog" -Template GenericList
Add-PnPField -List "SDS_Catalog" -DisplayName "Chemical Name" -InternalName "ChemicalName" -Type Text -Required
Add-PnPField -List "SDS_Catalog" -DisplayName "Trade Name" -InternalName "TradeName" -Type Text
Add-PnPField -List "SDS_Catalog" -DisplayName "Image URL" -InternalName "ImageURL" -Type Text
Add-PnPField -List "SDS_Catalog" -DisplayName "Document URL" -InternalName "DocumentURL" -Type Text
Add-PnPField -List "SDS_Catalog" -DisplayName "Is Code 1 Required" -InternalName "IsCode1Required" -Type Boolean
Add-PnPField -List "SDS_Catalog" -DisplayName "Is Flammable In Dept" -InternalName "IsFlammableInDept" -Type Boolean

# Multi-choice Hazards
[string[]]$hazards = @("สารออกซิไดซ์","สารไวไฟ","วัตถุระเบิด","วัตถุมีพิษ","สารกัดกร่อน","แก๊ส","อันตรายต่อสุขภาพ","อันตรายต่อสิ่งแวดล้อม","วัตถุระคายเคือง","ประเภทอื่น ๆ")
Add-PnPField -List "SDS_Catalog" -DisplayName "Hazards" -InternalName "Hazards" -Type Choice -Choices $hazards -AddToDefaultView

# Multi-choice PPE
[string[]]$ppe = @("สวมถุงมือ","สวมหน้ากาก","สวมแว่นตา","สวมเสื้อกันสารเคมี","รองเท้าบู๊ท")
Add-PnPField -List "SDS_Catalog" -DisplayName "PPE" -InternalName "PPE" -Type Choice -Choices $ppe -AddToDefaultView

# -------------------------------------------------------------
# 2. Create SDS_Inventory
# -------------------------------------------------------------
New-PnPList -Title "SDS_Inventory" -Template GenericList
Add-PnPField -List "SDS_Inventory" -DisplayName "Department" -InternalName "Department" -Type Text
Add-PnPField -List "SDS_Inventory" -DisplayName "Max Quantity" -InternalName "MaxQuantity" -Type Text
Add-PnPField -List "SDS_Inventory" -DisplayName "Storage Area" -InternalName "StorageArea" -Type Text

# Lookup field to SDS_Catalog (Title)
$catalogList = Get-PnPList -Identity "SDS_Catalog"
Add-PnPField -List "SDS_Inventory" -DisplayName "SDS Code" -InternalName "SDSCode" -Type Lookup -LookupList $catalogList.Id -LookupFieldName "Title"

# -------------------------------------------------------------
# 3. Create SDS_Requests
# -------------------------------------------------------------
New-PnPList -Title "SDS_Requests" -Template GenericList
Add-PnPField -List "SDS_Requests" -DisplayName "Requested At" -InternalName "RequestedAt" -Type DateTime
Add-PnPField -List "SDS_Requests" -DisplayName "Department" -InternalName "Department" -Type Text
Add-PnPField -List "SDS_Requests" -DisplayName "Existing SDS Code" -InternalName "ExistingSDSCode" -Type Text
Add-PnPField -List "SDS_Requests" -DisplayName "Chemical Name" -InternalName "ChemicalName" -Type Text
Add-PnPField -List "SDS_Requests" -DisplayName "Trade Name" -InternalName "TradeName" -Type Text
Add-PnPField -List "SDS_Requests" -DisplayName "Max Quantity" -InternalName "MaxQuantity" -Type Text
Add-PnPField -List "SDS_Requests" -DisplayName "Storage Area" -InternalName "StorageArea" -Type Text
# Note: SharePoint Lists have built-in Attachments enabled by default.
# Multiple attachments per item (PDFs, Images, Safety documents) are supported automatically.
Add-PnPField -List "SDS_Requests" -DisplayName "Reviewed At" -InternalName "ReviewedAt" -Type DateTime
Add-PnPField -List "SDS_Requests" -DisplayName "Reviewer Comment" -InternalName "ReviewerComment" -Type Note

[string[]]$reqTypes = @("เพิ่มสารเคมีใหม่","แก้ไขข้อมูลสารเคมี","ยกเลิก/ลบออกจากแผนก")
Add-PnPField -List "SDS_Requests" -DisplayName "Request Type" -InternalName "RequestType" -Type Choice -Choices $reqTypes

[string[]]$statusChoices = @("Pending","Approved","Rejected")
Add-PnPField -List "SDS_Requests" -DisplayName "Status" -InternalName "Status" -Type Choice -Choices $statusChoices

Add-PnPField -List "SDS_Requests" -DisplayName "Hazards" -InternalName "Hazards" -Type Choice -Choices $hazards
Add-PnPField -List "SDS_Requests" -DisplayName "PPE" -InternalName "PPE" -Type Choice -Choices $ppe

Write-Host "All SDS SharePoint Lists created successfully!" -ForegroundColor Green
