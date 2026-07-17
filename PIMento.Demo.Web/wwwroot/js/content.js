var customizeApplication = {};
customizeApplication.appId = 0;
customizeApplication.appName = "";
customizeApplication.appYear = 0;
customizeApplication.appMake = "";
customizeApplication.appModel = "";
customizeApplication.applicationSlug = "";


function LoadYearPopup(productId, isUniversal) {

    $.post("/Product/CallProductAPI", { productId: productId, isUniversal: isUniversal }, function (data) {
        if (data != "") {
            let item = data;

            item.sort(function (a, b) { return b - a });
            setCookieValuesToAppProp();
            bindToDropdown("ddlYear", item, "-1", "-- Year --");
            
            setAutoConfigurator(productId, isUniversal);
        }
        else
        {
            setCookieValuesToAppProp();
        }
        

    });
}

function bindToDropdown(id, options, defaultOptValue, defaultOptName) {

    var optionsValue = options;
    var element = $("#" + id);
    $("#" + id).html('');
    if (typeof defaultOptValue !== 'undefined' && defaultOptName !== 'undefined') {
        element.append('<option value="' + defaultOptValue + '">' + defaultOptName + '</option>');
    }
    $.each(optionsValue, function (k, item) {
        element.append('<option value="' + item + '">' + item + '</option>');
    });

    //if (customizeApplication.appId > 0)
    //{
    //    $("#ddlYear").val(customizeApplication.appYear);
    //}
    if (optionsValue.length == 1) {
        $("#" + id).attr("disabled", true);
    }
    $("#" + id).focus();
}

function GetMakeByYear() {
    $("#divItemDeatisl").empty();
    $('#ddlMake').empty();
    $('#ddlMake').html('<option value="-1">-- Make --</option>');
    $('#ddlMake').attr("disabled", true);
    $("#ddlModel").empty();
    $("#ddlModel").html('<option value="-1">-- Model --</option>');
    $('#ddlModel').attr("disabled", true);
    //resetModifiersContainer();

    $("#divCaptureFitmentGaps").empty();
    //selectedAttributeArray = [];

    $('#indicator_ddlModel').remove();
    $('#indicator_ddlMake').remove();

    if ($('#ddlYear').val() != -1) {
        $('#ddlMake').attr("disabled", false);

        var yearId = $('#ddlYear').val();
        var productId = 0;

        productId = $('#hdnProductId').val() == "" || null ? 0 : $('#hdnProductId').val();

        $.ajax({
            type: 'POST',
            url: '/Product/GetMakesByYear',
            data: { year: yearId, productId: productId },
            //crossDomain: true,

            success: function (data) {
                debugger;
                //let item = JSON.parse(data.value);
                changeYearSuccessHandler(data);
                //bindToDropdown("ddlMake", item, "", "-- Make --");

                
            },
            error: function (data) {
                //showErrorPopup();
            }
        });
    }
    //else clearChildElement();
}

function changeYearSuccessHandler(data) {
    debugger;
    jQuery(function ($) { // First argument is the jQuery object
        // Do stuff to the DOM
        $("#ddlYear").before(drawSelectionIndicator("ddlYear", true));
        debugger;
        var makeArray = [];
        var modelArray = [];
        var json = JSON.parse(data);

        $('#divConfigSelector').empty();
        $('#divFeatures').empty();
        $('#colourSelectContainer').empty();

        if ($('#hdnisProductUniversal').val() == 1) {
            $.each(json.value, function (k, item) {
                makeArray.push(item.make);
            });
            //$('#ddlModel').html('<option value="-1">-- Model --</option>');
            //$('#ddlModel').attr("disabled", true);
            if ($('#hdnIsTypeLoose').val() == 1) $("#divItemDeatisl").empty();
        }
        else {

            //$("#divItemDeatisl").empty();
            //checkApplicationProductImage(json);

            if (json.make != undefined) {
                if ($('#hdnisProductUniversal').val() == 0) {
                    checkForItem(json, true);
                }
                makeArray.push(json.make);
            }
            if (json.makes instanceof Array) {
                makeArray = json.makes;
            } else if (json.makes != undefined) makeArray.push(json.makes);
            //else makeArray.push(json.makes);
            if (json.model != undefined) {
                modelArray.push(json.model);
            }
            else modelArray = json.models;

        }
        //if (makeArray.length > 1 || $('#hdnisProductUniversal').val() == 1) {
        //    $('#ddlMake').html('<option value="-1">-- Make --</option>');
        //}
        if (makeArray.length == 1) $('#ddlMake').empty();
        if ($('#hdnisProductUniversal').val() == 1) {
            $('#ddlMake').html('<option value="-1">-- Make --</option>');
        }
        $('#ddlMake').removeAttr("disabled");
        for (i = 0; i < makeArray.length; i++) {
            $('#ddlMake').append('<option value="' + makeArray[i] + '">' + makeArray[i] + '</option>');
        }

        //if (customizeApplication.appId > 0) $("#ddlMake").val(customizeApplication.appMake);

        $('#ddlMake').focus();
        if ($('#hdnisProductUniversal').val() == 0) {
            if (modelArray == undefined) {
                $('#ddlModel').html('<option value="-1">-- Model --</option>');
                $('#ddlModel').attr("disabled", true);
            }
            else {
                $('#ddlModel').empty();
                if (modelArray.length == 0 || modelArray.length > 1) $('#ddlModel').html('<option value="-1">-- Model --</option>');

                $('#ddlModel').removeAttr("disabled");
                $('#ddlModel').focus();

                for (i = 0; i < modelArray.length; i++) {
                    $('#ddlModel').append('<option value="' + modelArray[i] + '">' + modelArray[i] + '</option>');
                }
            }
        }
        if (makeArray.length == 1) $("#ddlMake").before(drawSelectionIndicator("ddlMake", true));
        if (modelArray != undefined && modelArray.length == 1) $("#ddlModel").before(drawSelectionIndicator("ddlModel", true));

        
        //var prePopulatedObject = getprepopulateValuesBasic();
        //if (prePopulatedObject.appMake != undefined) {
        //    $('#ddlMake').val(prePopulatedObject.appMake);
        //    GetModelByMakeAndYear();
        //}
        //if (makeArray.length == 1 && modelArray.length > 0 && prePopulatedObject.appModel != undefined) {
        //    $('#ddlModel').val(prePopulatedObject.appModel);
        //    GetSubModelByModel();
        //}
    });
}


function GetModelByMakeAndYear() {

    $("#divItemDeatisl").empty();
    $('#indicator_ddlModel').remove();

    $('#ddlModel').empty();
    $('#ddlModel').html('<option value="-1">-- Model --</option>');
    let yearId = $('#ddlYear').val();
    let makeId = $('#ddlMake').val();
  
    let productId = 0;

    productId = $('#hdnProductId').val() == "" || null ? 0 : $('#hdnProductId').val();

    $('#ddlModel').removeAttr("disabled");
    // $('#ddlModel').attr("disabled", true);
    if (makeId != -1) {
        $.ajax({
            type: 'POST',
            url: '/Product/GetYearsByMakeAndModel',
            data: { year: yearId, make: makeId, productId: productId },
            crossDomain: true,

            success: function (data) {
                $('#ddlModel').empty();
                $("#ddlMake").before(drawSelectionIndicator("ddlMake", true))
                var modelArray = [];
                let item = JSON.parse(data);

                if ($('#hdnisProductUniversal').val() == 1) {
                    $.each(item.value, function (k, item) {
                        modelArray.push(item.model);
                    });
                }
                else {
                    //checkApplicationProductImage(json);
                    if (item.model != undefined) {
                        checkForItem(item, true);
                        modelArray.push(item.model);
                    }
                    else modelArray = item.models;
                }
                if (modelArray.length > 1) {
                    $('#ddlModel').html('<option value="-1">-- Model --</option>');
                }

                //$('#ddlModel').removeAttr("disabled");
                for (i = 0; i < modelArray.length; i++) {
                    $('#ddlModel').append('<option value="' + modelArray[i] + '">' + modelArray[i] + '</option>');
                }

                $('#ddlModel').focus();

                if (modelArray.length == 1) {
                    $("#ddlModel").before(drawSelectionIndicator("ddlModel", true));

                    //if ($('#hdnIsTypeLoose').val() == 1) {
                    GetSubModelByModel();
                    //}
                }
            },
            error: function (data) {
                showErrorPopup();
            }
        });
    }
    else $('#ddlModel').html('<option value="-1">-- Model --</option>');
}

function GetSubModelByModel() {
    let makeId = $('#ddlMake').val();
    let modelId = $('#ddlModel').val();
    let yearId = $('#ddlYear').val();
  
    let productId = $('#hdnProductId').val() == "" || null ? 0 : $('#hdnProductId').val();
    

    var ProductUniversal = {};
    ProductUniversal.productId = productId;
    ProductUniversal.year = yearId;
    ProductUniversal.make = makeId;
    ProductUniversal.model = modelId;

    if (modelId != "") {
        $.ajax({
            type: 'POST',
            url: '/Product/GetPositionByModel',
            data: { ProductUniversal: ProductUniversal },
            //crossDomain: true,

            success: function (data) {
                var json = JSON.parse(data);
                //checkApplicationProductImage(json);
                //resetConfigOption();
                checkForItem(json, true);
                //if (checkprepopulatedstatus()) {
                //    setPrepopulatedDataByTags();
                //}
                //postAnalyticData(json.applicationId, "", $("#hdnProductId").val());
            },
            error: function (data) {

                if ($('#hdnIsTypeLoose').val() == 1) {
                    $("#divCaptureFitmentGaps").html("We’re sorry, we do not have an option for the application selected. <a href='javascript:return void(0);' onclick='leadsandInqueryPop(1)'> Click here</a>  to be notified when we do.");
                    $("#hdnFromSource").val('1');
                    collectGapInformation();
                } //else showErrorPopup();
            }
        });
    }
}

function checkForItem(json, isfilterd, obj) {
    jsonresponse = {};

    let hasItems = false;
    let itemsArray = [];
    let attributesArray = [];
    let itemImageCurserClass = "cursor-pointer";

    let attributesDetails = "";

    if (json.item != undefined) {
        itemsArray.push(json.item);
        hasItems = true;
    }
    else if (json.items != undefined) {

        itemsArray = json.items;
        hasItems = true;
    }
    if (isfilterd) {
        var value = $(obj).attr("dropdown_asc_val")

        if (obj != undefined) {
            setConfigOption(json, false, value);
        } else setConfigOption(json, true, value);
    }
    //-----------------attributes--------------//

    if (json.attributes != undefined && !hasItems) {
        $.each(json.attributes, function (k, item) {
            if (item.attributeOptionValue != null) {
                var found = selectedAttributeArray.some(function (el) {
                    return el.attributeId === item.attributeId;
                });
                if (!found) {
                    selectedAttributeArray.push(item);
                }
            }
        });
    }

    if (json.selectAttribute != undefined) {
        attributesArray.push(json.selectAttribute);

    }
    else if (json.selectAttributes != undefined) {
        attributesArray = json.selectAttributes;

    }
    if (attributesArray.length > 0) {
        drawAttributes(attributesArray);

    }
    //-----------------draw items--------------//
    if (hasItems) {

        //checkItemsColourAvailability(itemsArray);  // check items colour

        let subModel = "";
        let trim = "";
        let position = "";
        let qtyHeader = "Quantity";

        //let syncType = $("#hdnsyncUserType").val();
        jsonresponse = json;

        let isSalePriceAvailable = false;
        let regularPrice = '0.00';
        let salePrice = '0.00';

        let formattedPrice = '0.00';
        let additionalNotes = "";
        $.each(json.attributes, function (k, item) {
            if (item.attributeOptionValue != null) {
                attributesDetails += item.attributeName + " : " + item.attributeOptionValue + "</br>";

                //-----------remove duplicated attributes----------
                selectedAttributeArray.some(function (el, i) {
                    isExist = false;
                    if (el.attributeId === item.attributeId) {
                        selectedAttributeArray.splice(i, 1);
                    }
                });
            }
        });

        //----------write missing attributes to the item details---------
        $.each(selectedAttributeArray, function (k, item) {
            if (item.attributeOptionValue != null) {
                attributesDetails += item.attributeName + " : " + item.attributeOptionValue + "</br>";
            }
        });

        if (json.subModel != null) subModel = " - " + json.subModel;
        if (json.trim != null) trim = " - " + json.trim;
        if (json.position != null) position = " - " + json.position;

        let productItems = "<div class='table-responsive'><table class='table table-bordred table-striped configurator-template' id='tbProductItem'><thead><tr class='mobile-tr'><th scope='col' class='col_0 item-number'>Item Number</th><th scope='col' class='col_5 description'>Description</th>" +
            "<th scope = 'col' class='col_0 text-right price' > Price</th> <th scope='col' class='col_4 pl-4 text-right quantity'>Quantity</th></thead><tbody>";

        for (var I = 0; I < itemsArray.length; I++) {
            if (itemsArray[I].pricing[I] != null) {
                regularPrice = formatPrice(itemsArray[I].pricing[I].price);
                if (itemsArray[I].pricing[I].isOnSale && new Date(itemsArray[I].pricing[I].saleStartDate) <= new Date() && (itemsArray[I].pricing[I].saleEndDate == null || new Date(itemsArray[I].pricing[I].saleEndDate) > new Date())) {

                    salePrice = formatPrice(itemsArray[I].pricing[I].salePrice);
                    isSalePriceAvailable = true;
                }
            }

            //formattedPrice = formatPrice(itemsArray[I].suggestedPrice);
            if (itemsArray[I].notes != null) additionalNotes = itemsArray[I].notes + "</br>";
            if (itemsArray[I].label != null) additionalNotes += itemsArray[I].label;
            if (itemsArray[I].itemImage == "" || itemsArray[I].itemImage == null) {
                itemsArray[I].itemImage = "";
                itemImageCurserClass = "cursor-pointer-false";
            }
            else itemImageCurserClass = "cursor-pointer";

            let itemImg = "";
            if (itemsArray[I].itemImage != "") itemImg = "<img class='" + itemImageCurserClass + "' src='" + itemsArray[I].itemImage + "' onclick='previewItemImage(this)'  />";
            else itemImg = "";

            let qtyHtml = "";
            let hasQty = true;
            let qtyMultiplier = 1;
            let defaultQTY = 1;
            let maxQTY = 10;

            debugger;
            if (itemsArray[I].isObsolete) {
                qtyHtml = "<td class='quantity item-input text-right' data-label='Quantity: &nbsp;'> <div class='float-right'> <div class='float-right'> Discontinued </div></td>"
            }
            else {
                hasQty = true;
                itemsArray[I].maxQuantity = itemsArray[I].maxQuantity == 0 ? 100 : itemsArray[I].maxQuantity;

                if (!itemsArray[I].calculateInventory) {
                    hasQty = true;
                }
                else if (itemsArray[I].calculateInventory) {
                    if (itemsArray[I].quantityInStock > 0 && itemsArray[I].maxQuantity >= itemsArray[I].quantityInStock) {
                        itemsArray[I].maxQuantity = itemsArray[I].quantityInStock ?? 0;
                    }
                    else if (itemsArray[I].nextRestockDate != null || itemsArray[I].quantityInStock == 0) {
                        hasQty = false;
                    }
                }
            }

            if (hasQty) {
                qtyMultiplier = itemsArray[I].qtyMultiplier == 0 ? 1 : itemsArray[I].qtyMultiplier;
                defaultQTY = itemsArray[I].minQuantity == 0 ? 1 : itemsArray[I].minQuantity;
                maxQTY = itemsArray[I].maxQuantity;

                let qtySelectorValue = 0;
                if (!itemsArray[I].calculateInventory || itemsArray[I].quantityInStock != 0) {
                    for (var i = defaultQTY; i <= maxQTY; i++) {
                        if (qtyMultiplier == 1) {
                            qtySelectorValue = i;
                        }
                        else if (i % qtyMultiplier == 0) {
                            qtySelectorValue = i;
                        }
                    }
                    qtyHtml = "<td class='quantity item-input text-right' data-label='Quantity: &nbsp;'> <div class='float-right'> <div class='float-right ml-md-3 quantity-new float-lg-left'> <input type='number' style='display: none;' class='buttons-only qty-collector w-58 px-2 text-center float-left' id='qty_" + itemsArray[I].itemId + "' skuId='" + itemsArray[I].itemId + "' value='0' min='" + defaultQTY +"' max='" + qtySelectorValue + "' maxQty='" + qtySelectorValue + "' /> </div></td>";
                    
                }
            }
            else {
                if (string.IsNullOrEmpty(itemsArray[I].inventoryMessage)) {
                    qtyHtml = "<td class='quantity item-input text-right' data-label='Quantity: &nbsp;'> <div class='float-right'> <div class='float-right'> <label>Out of stock</label> </div></td>"
                }
                else {
                    qtyHtml = "<td class='quantity item-input text-right' data-label='Quantity: &nbsp;'> <div class='float-right'> <div class='float-right'> <label> " + itemsArray[I].inventoryMessage + "</label> </div></td>"
                }
            }

            if (isSalePriceAvailable) {
                productItems += "<tr><td class='pt-2' data-label='Item Number: &nbsp;'>" + itemsArray[I].itemNumber + "</td><td class='pt-2' data-label='Description: &nbsp;'>" + itemsArray[I].itemDetails + "</br> Fits " + (json.year == undefined ? "" : json.year) + " " + json.make + " " + json.model + subModel + trim + position + "</br>" + attributesDetails + additionalNotes + "</td>" +
                    "<td class='pt-2 text-right' data-label='Price: &nbsp;'><span class='w-100 d-inline-block text-decoration-line-through'> " + regularPrice + "/" + itemsArray[I].units + " </span><span class='w-100 d-inline-block'> " + salePrice + "/" + itemsArray[I].units + " </span></td>" + qtyHtml;
            }
            else {
                productItems += "<tr><td class='pt-2' data-label='Item Number: &nbsp;'>" + itemsArray[I].itemNumber + "</td><td class='pt-2' data-label='Description: &nbsp;'>" + itemsArray[I].itemDetails + "</br> Fits " + (json.year == undefined ? "" : json.year) + " " + json.make + " " + json.model + subModel + trim + position + "</br>" + attributesDetails + additionalNotes + "</td>" +
                    "<td class='pt-2 text-right' data-label='Price: &nbsp;'>" + regularPrice + "/" + itemsArray[I].units + "</td>" + qtyHtml;
                    
            }

            //if (isSalePriceAvailable) {
            //    productItems += "<tr><td class='pt-2' data-label='Item Number: &nbsp;'>" + itemsArray[I].itemNumber + "</td><td class='pt-2' data-label='Description: &nbsp;'>" + itemsArray[I].itemDetails + "</br> Fits " + (json.year == undefined ? "" : json.year) + " " + json.make + " " + json.model + subModel + trim + position + "</br>" + attributesDetails + additionalNotes + "</td>" +
            //        "<td class='pt-2 text-right' data-label='Price: &nbsp;'><span class='w-100 d-inline-block text-decoration-line-through'> " + regularPrice + "/" + itemsArray[I].units + " </span><span class='w-100 d-inline-block'> " + salePrice + "/" + itemsArray[I].units + " </span></td><td data-label='Quantity: &nbsp; ' class='quantity pl-lg-4 item-input text-right'>" +
            //        "<span onclick='orderEntry.qtyHandler(" + itemsArray[I].itemId + ", -1) ' class='float-left minus-btn'><i class='far fa-minus font-weight-bold cursor-pointer'></i></span>" +
            //        "<input class='qty-collector w-40 w-sm-25 px-2 text-center float-left' type='text' onkeyup='' min='0' max='999' id='qty_" + itemsArray[I].itemId + "' skuId='" + itemsArray[I].itemId + "' value='0' />" +
            //        "<span onclick='orderEntry.qtyHandler(" + itemsArray[I].itemId + ", 1) ' class='plus-btn float-left'><i class='far fa-plus font-weight-bold cursor-pointer'></i></span></td>";
            //}
            //else
            //{
            //    productItems += "<tr><td class='pt-2' data-label='Item Number: &nbsp;'>" + itemsArray[I].itemNumber + "</td><td class='pt-2' data-label='Description: &nbsp;'>" + itemsArray[I].itemDetails + "</br> Fits " + (json.year == undefined ? "" : json.year) + " " + json.make + " " + json.model + subModel + trim + position + "</br>" + attributesDetails + additionalNotes + "</td>" +
            //        "<td class='pt-2 text-right' data-label='Price: &nbsp;'>" + regularPrice + "/" + itemsArray[I].units + "</td><td data-label='Quantity: &nbsp; ' class='quantity pl-lg-4 item-input text-right'>" +
            //        "<span onclick='orderEntry.qtyHandler(" + itemsArray[I].itemId + ", -1) ' class='float-left minus-btn'><i class='far fa-minus font-weight-bold cursor-pointer'></i></span>" +
            //        "<input class='qty-collector w-40 w-sm-25 px-2 text-center float-left' type='text' onkeyup='' min='0' max='999' id='qty_" + itemsArray[I].itemId + "' skuId='" + itemsArray[I].itemId + "' value='0' />" +
            //        "<span onclick='orderEntry.qtyHandler(" + itemsArray[I].itemId + ", 1) ' class='plus-btn float-left'><i class='far fa-plus font-weight-bold cursor-pointer'></i></span></td>"; 
            //}
            
        }

        //if (itemsArray.length > 0)
        //{
        //    PutCurrentProductDetailsInSession(itemsArray);
        //}
        productItems += "</tr></tbody></table></div><div class='col-12 text-right px-0 mt-4'> <button type='button' class='common-orange-button px-4' onclick='orderEntry.addToBucket()'>Add to Cart</button></div>";
        //----show modifiers
        //beginShowModifiers();

        $("#divItemDeatisl").html(productItems);
        $(".buttons-only").inputSpinner({ buttonsOnly: true });
        //$("input[type='number']").inputSpinner();
    }
    else
    {
        $("#divItemDeatisl").empty();
    } 
}


function setConfigOption(json, refreshAll, number) {

    var subModelArray = [];
    var positionArray = [];
    var trimArray = [];

    if (json.subModels != undefined) {
        subModelArray = json.subModels;
    }
    else if (json.subModel != null) {
        subModelArray.push(json.subModel);
    }

    //if (json.position != undefined) {
    //    $.each(json.position, function (k, item) {
    //        positionArray.push(item);
    //    });
    //}
    //else if (json.positions != undefined) {
    //    positionArray=json.positions;

    //}

    if (json.position instanceof Array) {
        positionArray = json.position
    }

    else if (json.position != null) {
        positionArray.push(json.position);
    }

    if (json.trim instanceof Array) {
        trimArray = json.trim
    }

    else if (json.trim != null) {
        trimArray.push(json.trim);
    }

    if (refreshAll) {
        $("#divConfigSelector").empty();
        manageDropDowns(subModelArray, positionArray, trimArray);
    }

    else {
        if ($("#divPosition").is(':visible')) { positionArray = []; };
        if ($("#divsubModel").is(':visible')) { subModelArray = []; };
        if ($("#divTrim").is(':visible')) { trimArray = []; };
        manageDropDowns(subModelArray, positionArray, trimArray);
    }

}

function formatPrice(priceData) {

    //let pricingLevelId = $("#hdnPricingLevelId").val();

    var priceObj;

    if (Array.isArray(priceData)) {

        let price = priceData.filter(function (item) {
            //if (item.pricingLevelId == pricingLevelId) {
            //    return item;
            //}
            return item;
        })

        priceObj = price[0];
    } else {
        priceObj = priceData;
    }

    return priceObj.toFixed(2).replace(/./g, function (c, i, a) { return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c; });
}


function manageDropDowns(subModelArray, positionArray, trimArray) {
    if (subModelArray.length >= positionArray.length) {
        if (subModelArray.length >= trimArray.length) {

            if (trimArray.length >= positionArray.length) {
                drawDropDowns("ddlPosition", positionArray, "divPosition", 1);
                drawDropDowns("ddlTrim", trimArray, "divTrim", 2);
            }
            else {
                drawDropDowns("ddlTrim", trimArray, "divTrim");
                drawDropDowns("ddlPosition", positionArray, "divPosition", 1);
            }
            drawDropDowns("ddlSubModel", subModelArray, "divsubModel", 2);
        }
        else {
            drawDropDowns("ddlPosition", positionArray, "divPosition", 1);
            drawDropDowns("ddlSubModel", subModelArray, "divsubModel", 2)
            drawDropDowns("ddlTrim", trimArray, "divTrim", 3);
        }
    }
    else {
        if (positionArray.length >= trimArray.length) {
            if (trimArray.length >= subModelArray.length) {
                drawDropDowns("ddlSubModel", subModelArray, "divsubModel", 1)
                drawDropDowns("ddlTrim", trimArray, "divTrim", 2);
            }
            else {
                drawDropDowns("ddlTrim", trimArray, "divTrim", 1);
                drawDropDowns("ddlSubModel", subModelArray, "divsubModel", 2)
            }
            drawDropDowns("ddlPosition", positionArray, "divPosition", 3);
        }
        else {
            drawDropDowns("ddlSubModel", subModelArray, "divsubModel", 1);
            drawDropDowns("ddlPosition", positionArray, "divPosition", 2);
            drawDropDowns("ddlTrim", trimArray, "divTrim", 3);
        }
    }
}

function drawDropDowns(id, options, container, number) {

    var name = "";
    var optionsValue = options;
    var optionName = "";

    switch (id) {
        case "ddlTrim": name = "Trim"; break;
        case "ddlSubModel": name = "Sub Model"; break;
        default: name = "Position";
    }

    if (optionsValue.length > 1 && !$("#" + container).is(":visible")) {
        $("#divConfigSelector").show();
        var optionContainer = "<div id='" + container + "' class='col-lg-12 col-md-12 col-sm-12 form-group'> <label>" + name + " </label></div>";

        $("#divConfigSelector").append(optionContainer);
        var selectionIndicator = drawSelectionIndicator(id);

        var element = selectionIndicator + "<select class='form-control' dropdown_asc_val ='" + number + "' id='" + id + "' onchange='sendConfigSetting(this)'></select>";
        $("#" + container).append(element);

        element = $("#" + id);
        if (optionsValue.length > 1) {
            element.html('<option value="-1">-- Select --</option>');
        }

        $.each(optionsValue, function (k, item) {
            optionName = item;
            if (optionName == null) optionName = 'Other';
            element.append('<option value="' + item + '">' + optionName + '</option>');
        });

        if (optionsValue.length == 1) {
            $("#" + id).attr("disabled", true);
        }
        $("#" + id).focus();

    }
}

function drawSelectionIndicator(id, isVisible) {
    if ($("#indicator_" + id).length == 0) {
        var visibilty = "hidden";
        if (isVisible) visibilty = "";
        return "<span id='indicator_" + id + "'" + visibilty + " class='wrapper-status-done'> <i class='fa fa-check-circle text-success' ></i></span>"
    }
    else return "";
}

function sendConfigSetting(obj, isPrepopulated) {

    if ($(obj).val() != "-1") {

        //showSelectionValidator($(obj).attr("id"))
        $("#divFeatures").empty();
        var value = $(obj).attr("dropdown_asc_val");
        removeNonRelatedOptions(obj);
        sendConfig(false, true, obj, isPrepopulated);
        //resetModifiersContainer();

    }
}

function removeNonRelatedOptions(value) {

    var isDelete = false;
    var parentElement = $(value).parent().attr("id");
    selectedAttributeArray = [];

    $("#divConfigSelector").find("div").each(function () {
        if (isDelete) {
            $(this).remove();
        }
        if (parentElement == $(this).attr("id")) isDelete = true;
    })

}

function sendConfig(isFeatureSelect, obj, changedElement, isPrepopulated) {
    var yearId = $('#ddlYear').val();
    var makeId = $('#ddlMake').val();
    var productId = $('#hdnProductId').val() == "" || null ? 0 : $('#hdnProductId').val();
    var modelId = $('#ddlModel').val();

    var ProductUniversal = {};
    var ProductFeatureArray = [];
    ProductUniversal.productId = productId;

    if ($('#ddlYear > option').length > 1) {
        ProductUniversal.year = yearId;

    }
    if ($('#ddlMake > option').length > 1) {
        ProductUniversal.make = makeId;

    }
    if ($('#ddlModel > option').length > 1) {

        ProductUniversal.model = modelId;
    }

    if ($('#ddlSubModel > option').length > 1) {
        ProductUniversal.subModel = $('#ddlSubModel').val();

    }
    if ($('#ddlPosition > option').length > 1) {
        ProductUniversal.position = $('#ddlPosition').val();

    }
    if ($('#ddlTrim > option').length > 1) {
        ProductUniversal.trim = $('#ddlTrim').val();
    }

    if (isFeatureSelect) {
        $("#divFeatures").find("select").each(function () {
            if ($(this).find('option').length > 1) {
                var ProductFeature = {};
                ProductFeature.attributeId = $(this).attr("feature_id");
                ProductFeature.attributeOptionId = $(this).val();
                ProductFeatureArray.push(ProductFeature);
            }
        });
    }
    else $('#divFeatures').empty();

    $.ajax({
        type: 'POST',
        url: '/Product/GetPositionByModel',
        data: { ProductUniversal: ProductUniversal, ProductFeatures: ProductFeatureArray },
        crossDomain: true,

        success: function (data) {
            var json = JSON.parse(data);
            checkForItem(json, !isFeatureSelect, changedElement);
            //if (checkprepopulatedstatus()) {
            //    setPrepopulatedDataByTags();
            //}
        },
        error: function (data) {
            showErrorPopup();
        }
    });

}

function getQuickMenuSyndication() {

    if ($("#quickMenuItemContainer").hasClass("menu-item-show")) {
        $("#quickMenuItemContainer").removeClass("menu-item-show");
    } else {
        $("#quickMenuItemContainer").addClass("menu-item-show");
    }
    if ($("#quickMenuItemContainer div").length == 0) {

        $.ajax({
            type: 'POST',
            url: '/Category/GetCategoryQuickMenu',
            data: { },
            crossDomain: true,
            success: function (data) {

                let container;
                //let subFunction;
                let listHeader;
                if (data.length > 0) {
  
                    //$("#quickMenuItemContainer").append("<span title='Home' class='home-icon'> <a href='/'><i class='fa fa-home' aria-hidden='true'></i></a></span>")
                    let tempArray = [];
                    for (var i = 1; i > 0; i++) {
                        tempArray = [];
                        tempArray = data.filter(function (item) {
                            return item.rank == i;
                        });
                        if (tempArray.length == 0) break;

                        tempArray = tempArray.map(function (item) {
                            if (i == 1) {
                                container = "quickMenuItemContainer";
                                //subFunction = "getCategoryChildren(" + item.categoryId + ", false)";
                                listHeader = "list-main-header";
                            }
                            else {
                                container = "quick_menu_parent_" + item.parentId;
                                subFunction = 'getCategoryChildren("' + item.categoryId + '","' + item.categoryName + '" )';
                                listHeader = "";
                            }
                            item.CategoryName = new Array(i).join(' ') + item.categoryName;
                            item.Container = container;
                            //item.SubFunction = subFunction;
                            item.class = listHeader;


                            return item;
                        });
                        returnMenuContent(tempArray);

                        $(document).on('click', function (event) {

                            var clickover = $(event.target);
                            var _opened = $("#quickMenuItemContainer").hasClass("menu-item-show");
                            if (_opened === true && (!clickover.hasClass("text-left") && !clickover.hasClass("btn-outline-success") && !clickover.hasClass("fa-bars"))) {
                                $("#quickMenuItemContainer").removeClass("menu-item-show");
                            }

                        });
                    }
                }
            },

        });
    }

    this.returnMenuContent = function (items) {

        items.map(function (item) {
            $("#" + item.Container).append("<div  id='quick_menu_parent_" + item.categoryId + "' class='rank_" + item.rank + "'><span class='" + item.class + "'> <a href='" + item.slug + "'>" + item.CategoryName + " </span> </div>");
        });
    }

}

function getCumstomization() {

    $("#ddlMakeCustomization").html("<option value='-1'>--Make--</option>");
    $("#ddlModelCustomization").html("<option value='-1'>--Model--</option>");
    $("#ddlYearCustomization").html("<option value='-1'>--Year--</option>");

    $("#customizationMenuContainer").modal("show");
    $("#lbCurrentApplication label").text(customizeApplication.appName);

    if ($("#ddlMakeCustomization option").length == 1 || customizeApplication.appId > 0) {
        getCumstomizationData(null, '', 'auto');
    }
}

function getCumstomizationData(obj, from, transmission) {
    debugger;
    let year = -1;
    let make = "";
    let model = "";

    let container = "ddlMakeCustomization";
    let initial = "--Make--";

    if (from == "make") {

        make = $(obj).val();
        container = "ddlModelCustomization";
        $("#ddlModelCustomization").prop("disabled", false);
        initial = "--Model--";
        $("#ddlYearCustomization").html("<option value='-1'>--Year--</option>");
        $("#ddlYearCustomization").prop("disabled", true);

        if (!$("#yearCustomizationContainer").hasClass("d-inline-block")) {
            $("#yearCustomizationContainer").addClass("d-inline-block");
            $("#yearCustomizationContainer").show();
        }
    }
    else if (from == 'model') {

        make = $("#ddlMakeCustomization").val();
        model = $(obj).val();
        container = "ddlYearCustomization";
        $("#ddlYearCustomization").prop("disabled", false);
        initial = "--Year--";

    }

    $.ajax({
        type: 'POST',
        url: '/Product/GetApplicationFilter',
        data: { year: year, make: make, model: model },
        crossDomain: true,
        success: function (data) {
            //$("#customize_confirm_selector").hide();
            $("#customize_confirm_selector").addClass('d-none');
            let item = JSON.parse(data).value;
            item = item.map(function (item) {
                if (from == '') {
                    return item.make;
                }
                else if (from == 'make') {
                    return item.model;
                }
                else if (from == 'model') {
                    return item.year;
                }
            });

            if (from == 'model') {
                if (item.length == 1 && item[0] == null) {
                    $("#yearCustomizationContainer").removeClass("d-inline-block");
                    $("#yearCustomizationContainer").hide();
                    //$("#customize_confirm_selector").show();
                    $("#customize_confirm_selector").removeClass('d-none');
                }
                else {
                    $("#yearCustomizationContainer").show();
                    item.sort(function (a, b) { return b - a });
                }
            }
            item = item.filter(function (item) {
                if (item != 'null') return item;
            })

            item = item.map(function (item) {
                return "<option value='" + item + "'>" + item + "</option>";
            });

            $("#" + container).html("<option value='-1'>" + initial + "</option>");
            $("#" + container).append(item.join(''));

            reGenerateYMMDropdowns(from, transmission);
        },
        error: function (data) {
        }
    });
}


function getMyAccountCumstomizationData(obj, from, transmission) {

    let year = -1;
    let make = "";
    let model = "";

    let container = "ddlMakeCustomization1";
    let initial = "--Make--";

    if (from == "make") {

        make = $(obj).val();
        container = "ddlModelCustomization1";
        $("#ddlModelCustomization1").prop("disabled", false);
        initial = "--Model--";
        $("#ddlYearCustomization1").html("<option value='-1'>--Year--</option>");
        $("#ddlYearCustomization1").prop("disabled", true);

    }
    else if (from == 'model') {

        make = $("#ddlMakeCustomization1").val();
        model = $(obj).val();
        container = "ddlYearCustomization1";
        $("#ddlYearCustomization1").prop("disabled", false);
        initial = "--Year--";

    }

    $.ajax({
        type: 'POST',
        url: '/Product/GetApplicationFilter',
        data: { year: year, make: make, model: model },
        crossDomain: true,
        success: function (data) {

            let item = JSON.parse(data).value;
            item = item.map(function (item) {
                if (from == '') {
                    return item.make;
                }
                else if (from == 'make') {
                    return item.model;
                }
                else if (from == 'model') {
                    return item.year;
                }
            });

            //if (from == 'model') {
            //    if (item.length == 1 && item[0] == null) {
            //        $("#yearCustomizationContainer1").removeClass("d-inline-block");
            //        $("#yearCustomizationContainer1").hide();
            //        //$("#customize_confirm_selector").show();
            //        //$("#customize_confirm_selector").removeClass('d-none');
            //    }
            //    else {
            //        $("#yearCustomizationContainer").show();
            //        item.sort(function (a, b) { return b - a });
            //    }
            //}
            item = item.filter(function (item) {
                if (item != 'null') return item;
            })

            item = item.map(function (item) {
                return "<option value='" + item + "'>" + item + "</option>";
            });

            $("#" + container).html("<option value='-1'>" + initial + "</option>");
            $("#" + container).append(item.join(''));

            reGenerateMyAccountYMMDropdowns(from, transmission);
        },
        error: function (data) {
        }
    });
}

function reGenerateMyAccountYMMDropdowns(from, transmission) {

    if (transmission == 'auto' && customizeApplication.appId > 0) {
        if (from == "") {
            $("#ddlMakeCustomization1").val(customizeApplication.appMake);
            getCumstomizationData($("#ddlMakeCustomization1"), 'make', 'auto');
        }
        else if (from == "make") {
            $("#ddlModelCustomization1").val(customizeApplication.appModel);
            getCumstomizationData($("#ddlModelCustomization1"), 'model', 'auto');
        }
        else if (from == 'model') {
            $("#ddlYearCustomization1").val(customizeApplication.appYear);
            setCumstomizationData($("#ddlYearCustomization1"));
        }
    }
}

function reGenerateYMMDropdowns(from, transmission) {
    debugger;
    if (transmission == 'auto' && customizeApplication.appId > 0) {
        if (from == "") {
            $("#ddlMakeCustomization").val(customizeApplication.appMake);
            getCumstomizationData($("#ddlMakeCustomization"), 'make', 'auto');
        }
        else if (from == "make") {
            $("#ddlModelCustomization").val(customizeApplication.appModel);
            getCumstomizationData($("#ddlModelCustomization"), 'model', 'auto');
        }
        else if (from == 'model') {
            $("#ddlYearCustomization").val(customizeApplication.appYear);
            setCumstomizationData($("#ddlYearCustomization"));
        }
    }
}

function setCumstomizationData(obj) {
    debugger;
    let make = $("#ddlMakeCustomization").val();
    let model = $("#ddlModelCustomization").val();

    if (make != "" && model != "" && $(obj).val() != -1)
    {
        $.ajax({
            type: 'POST',
            url: '/Product/GetApplicationByYMM',
            //data: { year: $("#ddlYearCustomization").val(), make: $("#ddlMakeCustomization").val(), model: $("#ddlModelCustomization").val() },
            data: { year: $(obj).val(), make: make, model: model },
            crossDomain: true,
            success: function (data) {

                let item = JSON.parse(data).value;
                customizeApplication.applicationSlug = item[0].slug;

                $("#customize_confirm_selector").show();
                $("#customize_confirm_selector").removeClass('d-none');
                $("#customize_confirm_selector").prop("disabled", false);

                //if ($(obj).val() != "-1") {
                //    $("#customize_confirm_selector").show();
                //    $("#customize_confirm_selector").removeClass('d-none');
                //    $("#customize_confirm_selector").prop("disabled", false);
                //}
                //$("#customize_confirm_selector").attr("href", "/" + applicationSlug);
                customizeApplication.appId = item[0].applicationId;
                customizeApplication.appName = item[0].applicationName;
                customizeApplication.appYear = item[0].year;
                customizeApplication.appMake = item[0].make;
                customizeApplication.appModel = item[0].model;

                //setCookie(customizeApplication);
                //var jsonString = JSON.stringify(customizeApplication);
                //document.cookie = "cookieObject=" + jsonString;   
                ////$("#quickMenuItemContainer").empty();
                ////$("#initialCustomizationHandler").hide();
                //if (customizeApplication.appId > 0) {
                //    reloadWithCustomizationCategoryLevel()
                //}
                //else if (customizeApplication.appId > 0) {
                //    beginLoadPage();
                //}
                //if (document.cookie.indexOf('cookieObject') != -1) {
                //    $(".icon-green").removeClass("d-none");
                //} else {
                //    $(".icon-green").addClass("d-none");
                //}
            },
            error: function (data) {
                customizeApplication.appId = 0;
                customizeApplication.appName = "";
            }
        });
    }

    
}

function redirectWithCustomization()
{
    customizeApplication.appMake = $("#ddlMakeCustomization").val();
    customizeApplication.appModel = $("#ddlModelCustomization").val();
    customizeApplication.year = $("#ddlYearCustomization").val();

    var jsonString = JSON.stringify(customizeApplication);
    sessionStorage.setItem("currentAppFilter", jsonString);

    if (sessionStorage.getItem('currentAppFilter').length > 0) {
        $(".icon-green").removeClass("d-none");
    }
    else
    {
        $(".icon-green").addClass("d-none");
    }
    //setCookie(customizeApplication);

    window.location.href = "/" + customizeApplication.applicationSlug;
}

function redirectFromAll(make, model, year,appId, path) {
    debugger;
    customizeApplication.appMake = make;
    customizeApplication.appModel = model;
    customizeApplication.appYear = year;
    customizeApplication.appId = appId;

    var jsonString = JSON.stringify(customizeApplication);
    sessionStorage.setItem("currentAppFilter", jsonString);

    window.location.href =  path;

}

//function setCookie(cookieArray)
//{
//    var jsonString = JSON.stringify(cookieArray);
//    document.cookie = "cookieObject=" + jsonString; 

//    if (document.cookie.indexOf('cookieObject') != -1) {
//        $(".icon-green").removeClass("d-none");
//    } else {
//        $(".icon-green").addClass("d-none");
//    }
//}

//function setCookieValuesToAppProp()
//{
//    var appCookie = "";
//    if (document.cookie.indexOf('cookieObject') != -1)
//    {
//        var cookieValue = document.cookie.split('; ').find(row => row.startsWith('cookieObject')).split('=')[1];


//        if (cookieValue != null && cookieValue != "") {
//            $(".icon-green").removeClass("d-none");
//            appCookie = JSON.parse(cookieValue);
//            customizeApplication.appId = appCookie.appId;
//            customizeApplication.appName = appCookie.appName;
//            customizeApplication.appModel = appCookie.appModel;
//            customizeApplication.appMake = appCookie.appMake;
//            customizeApplication.appYear = appCookie.appYear;
//        } else {
//            $(".icon-green").addClass("d-none");
//        }      
//    } else {
//           $(".icon-green").addClass("d-none");
//    }
//}

function setCookieValuesToAppProp()
{
    if (sessionStorage.getItem('currentAppFilter') != null && sessionStorage.getItem('currentAppFilter').length > 0) {
        $(".icon-green").removeClass("d-none");
        var currentFilter = JSON.parse(sessionStorage.getItem('currentAppFilter'));
        customizeApplication.appId = currentFilter.appId;
        customizeApplication.appName = currentFilter.appName;
        customizeApplication.appModel = currentFilter.appModel;
        customizeApplication.appMake = currentFilter.appMake;
        customizeApplication.appYear = currentFilter.appYear;
    }
    else
    {
        $(".icon-green").addClass("d-none");
    }
}

//function redirectWithCustomization() {

//    let year = $("#ddlYearCustomization").val();
//    let make = $("#ddlMakeCustomization").val();
//    let model = $("#ddlModelCustomization").val();

//    window.location.href = "/Product/FilterProductView?year=" + year + "&make=" + make + "&model=" + model;

//}

//function reloadWithCustomization(year, make, model) {
//    $.ajax({
//        type: 'POST',
//        url: '/Product/GetApplicationByYMM',
//        //data: { year: $("#ddlYearCustomization").val(), make: $("#ddlMakeCustomization").val(), model: $("#ddlModelCustomization").val() },
//        data: { year: year, make: make, model: model },
//        crossDomain: true,
//        success: function (data) {

//            let item = JSON.parse(data).value;

//            customizeApplication.appId = item[0].applicationId;
//            customizeApplication.appName = item[0].applicationName;
//            customizeApplication.appYear = item[0].year;
//            customizeApplication.appMake = item[0].make;
//            customizeApplication.appModel = item[0].model;
//            //$("#quickMenuItemContainer").empty();
//            //$("#initialCustomizationHandler").hide();
//            if (customizeApplication.appId > 0) {
//                reloadWithCustomizationCategoryLevel()
//            }
//            //else if (customizeApplication.appId > 0) {
//            //    beginLoadPage();
//            //}
//        },
//        error: function (data) {
//            customizeApplication.appId = 0;
//            customizeApplication.appName = "";
//        }
//    });

//}

//function reloadWithCustomizationCategoryLevel() {

//    $.ajax({
//        type: 'POST',
//        url: '/Product/FilterCategoryProducts',
//        //data: { applicationId: customizeApplication.appId, year: customizeApplication.appYear, make: customizeApplication.appMake, model: customizeApplication.appModel },
//        data: { applicationId: customizeApplication.appId},
//        crossDomain: true,
//        success: function (data) {
            
//            if (customizeApplication.appId > 0) {
//                //window.location.assign("/Product/FilterProductView");
//                //$("#customizedApplicationFilterReset").show()

//                $("#lbcustomizeApplicationName").text("Showing Parts & Accessories for your " + customizeApplication.appYear + " " + customizeApplication.appMake + " " + customizeApplication.appModel);
//                $("#customizedApplicationFilterReset").show();
//                $(".wrapper-catelog").html(data);

//            }
//            else
//            {
//                $("#customizedApplicationFilterReset").hide();
//            }
//        },
//        error: function (data) {
//            customizeApplication.appId = 0;
//            customizeApplication.appName = "";
//        }
//    });
//}

function resetCustomization() {
    if (customizeApplication.appId > 0) {
        customizeApplication.appId = 0;
        customizeApplication.appName = '';
        customizeApplication.appYear = 0;
        customizeApplication.appMake = "";
        customizeApplication.appModel = "";
        $("#quickMenuItemContainer").empty();

        removeFilter();
        window.location.assign("/");
        //const obj = $("#syndicationBreadcrumbContainer a:last-child");
        //if (obj.length > 0) window.location.assign($("#syndicationBreadcrumbContainer a.active")[0].baseURI);
        //else window.location.assign("/");
    }
}

function trySearch() {
    //$("#searchContainer").removeClass('d-none');
    //$(document).mouseup(function (e) {
    //    var container = $("#searchContainer");

    //    // If the target of the click isn't the container
    //    if (!container.is(e.target) && container.has(e.target).length === 0) {
    //        $("#searchContainer").addClass('d-none');
    //    }
    //});
}

function loadTabs(obj) {
    $('.wrapper-tabs-pils-section .tabs-content-wrapper').each(function () {
        $(this).hide();
    });
    var container = $(obj).attr('prefer');
    $("#" + container).show();
}

function showChildModifier(obj) {
    let current;
    let sub = [];
    let parent = $(obj).attr("modifierid");
    let element = $("#modifiersContainer [sub-of='" + parent + "']");
    if ($(obj).val().length > 0) {
        $(element).show();
        $(element).parent().show();

    }
    else {
        while ($(element).length > 0) {
            sub = [];
            $.each(element, function (k, item) {
                parent = $(item).parent();
                if ($(item).children().find("button").length == 1 && $(item).children().find("button").attr("title") == "change selected") {
                    if ($(item).parent().is(":visible")) {
                        $(item).children().find("button").trigger("click");
                    }
                }
                else {
                    $(item).children()[1].value = "";
                }
                $(parent).hide();
                current = $("#modifiersContainer [sub-of='" + $(element).attr("current-modifierid") + "']");
                if ($(current).length > 0) sub.push(current);

            });
            element = sub.concat();
        }
    }
}

function loadImageViwer(obj) {

    $("#modalDispplayImageInfo").modal("show");
    $("#modalDispplayImageInfo .modal-body").html("<div><div class='wrapper-img-full float-left'><img  src='" + $(obj).attr("data-img-scr") + "' /></div><div class='wrapper-description'><h3>" + $(obj).attr("data-name") + " </h3><p>" + $(obj).attr("data-description") + " </p></div></div>");

}

//function selectProductModifier(optionId, modifierName, image, optionName, position, modifierCaption, modifierId, parentId, instanceId, modifierPrice) {
//    debugger;
//    let originalSalePrice = Number($("#hdnSalePrice").val().trim());
//    let originalRegularPrice = Number($("#hdnRegularPrice").val().trim());

//    $("#modifier_" + modifierId).hide();
//    $("#modifiersContainer").show();
//    $("#modifiersContainer div [sub-of='" + modifierId + "']").show();
//    $("#modifiersContainer div [sub-of='" + modifierId + "']").parent().show();

//    //if ($("input[type='checkbox'][name='chkselectedModifier']").length != 1) {
//    //    setDefaultPrices(originalSalePrice, originalRegularPrice)
//    //}

    

//    let newPrice = 0.0;
//    let salePrice = Number($("#salePrice1").text().substring(1).trim());
//    let regularPrice = Number($("#regularPrice1").text().substring(1).trim());

//    if ($("#hdnSalePriceAvailable").val().toLowerCase() == "true") {
//        newPrice = salePrice + modifierPrice;
//        $("#salePrice1").text("$" + newPrice.toFixed(2));
//    }
//    else {
//        newPrice = regularPrice + modifierPrice;
//        $("#regularPrice1").text("$" + newPrice.toFixed(2));
//    }   

//    var mCount = $("#hdnModifiersCount").val();
//    --position;
//    debugger;
//    for (var i = 1; i <= mCount; i++) {

//        if (i == position) {
//            if (image == "") {
//                $("#modifier_selector_" + position).html("<div class='col-12 px-0' current-modifierid='" + modifierId + "' sub-of='" + parentId + "' style='display:inline-block;'><div class='wrapper-set-white-bg'><input type='checkbox' hidden checked  name='chkselectedModifier' instanceId='" + instanceId + "' modifierid='" + modifierId + "'  optionId='" + optionId + "' modifierName='" + modifierName + "' optionName='" + optionName + "' modifierPrice='" + modifierPrice + "'/><div class='wrapper-midifier-header'> <label style='margin-bottom:0 !important;'>" + modifierCaption + "</label><button type='button' style='cursor:pointer;' title='change selected' onclick='changeProductModifier(" + optionId + "," + position + ", " + originalSalePrice + ", " + originalRegularPrice + ", " + modifierPrice + ")'> <i class='fa fa-edit' ></i></button></div><div class='wrapper-item-selector'> <br/><label> " + optionName + "</label></div></div></div>");
//            }
//            else {
//                $("#modifier_selector_" + position).html("<div class='col-12 px-0' current-modifierid='" + modifierId + "' sub-of='" + parentId + "' style='display:inline-block;'><div class='wrapper-set-white-bg'><input type='checkbox' hidden checked  name='chkselectedModifier' instanceId='" + instanceId + "' modifierid='" + modifierId + "'  optionId='" + optionId + "' modifierName='" + modifierName + "' optionName='" + optionName + "' modifierPrice='" + modifierPrice + "'/><div class='wrapper-midifier-header'> <label style='margin-bottom:0 !important;'>" + modifierCaption + "</label><button type='button' style='cursor:pointer;' title='change selected' onclick='changeProductModifier(" + optionId + "," + position + ", " + originalSalePrice + ", " + originalRegularPrice + ", " + modifierPrice + ")'> <i class='fa fa-edit' ></i></button></div><div class='wrapper-item-selector'><img src='" + image + "' /> <br/><label> " + optionName + "</label></div></div></div>");
//            }
//            continue;
//        }

//        if ($("#modifier_selector_" + i + " input[type='checkbox'][name='chkselectedModifier']").is(':checked')) {
//            $("#modifier_selector_" + i).html($("#modifier_selector_" + i).html());
//        }
//        else
//        {
//            $("#modifier_" + i).hide();
//            $("#modifier_selector_" + i).html($("#syncOptionModList #modifier_" + i).html());
//        }
        

        
//    }
//    //if (image == "")
//    //{
//    //    $("#modifier_selector_" + position).html("<div class='col-12 px-0' current-modifierid='" + modifierId + "' sub-of='" + parentId + "' style='display:inline-block;'><div class='wrapper-set-white-bg'><input type='checkbox' hidden checked  name='chkselectedModifier' instanceId='" + instanceId + "' modifierid='" + modifierId + "'  optionId='" + optionId + "' modifierName='" + modifierName + "' optionName='" + optionName + "' modifierPrice='" + modifierPrice + "'/><div class='wrapper-midifier-header'> <label style='margin-bottom:0 !important;'>" + modifierCaption + "</label><button type='button' style='cursor:pointer;' title='change selected' onclick='changeProductModifier(" + optionId + "," + position + ", " + originalSalePrice + ", " + originalRegularPrice + ", " + modifierPrice + ")'> <i class='fa fa-edit' ></i></button></div><div class='wrapper-item-selector'> <br/><label> " + optionName + "</label></div></div></div>");
//    //}
//    //else
//    //{
//    //    $("#modifier_selector_" + position).html("<div class='col-12 px-0' current-modifierid='" + modifierId + "' sub-of='" + parentId + "' style='display:inline-block;'><div class='wrapper-set-white-bg'><input type='checkbox' hidden checked  name='chkselectedModifier' instanceId='" + instanceId + "' modifierid='" + modifierId + "'  optionId='" + optionId + "' modifierName='" + modifierName + "' optionName='" + optionName + "' modifierPrice='" + modifierPrice + "'/><div class='wrapper-midifier-header'> <label style='margin-bottom:0 !important;'>" + modifierCaption + "</label><button type='button' style='cursor:pointer;' title='change selected' onclick='changeProductModifier(" + optionId + "," + position + ", " + originalSalePrice + ", " + originalRegularPrice + ", " + modifierPrice + ")'> <i class='fa fa-edit' ></i></button></div><div class='wrapper-item-selector'><img src='" + image + "' /> <br/><label> " + optionName + "</label></div></div></div>");
//    //}
    
//}

//function setDefaultPrices(defaultSalePrice, defaultRegularPrice)
//{
//    if ($("#hdnSalePriceAvailable").val().toLowerCase() == "true") {
//        $("#salePrice1").text("$" + defaultSalePrice.toFixed(2));
//    }
//    else
//    {
//        $("#regularPrice1").text("$" + defaultRegularPrice.toFixed(2));
//    }
//}

//function changeProductModifier(optionId, position, defaultSalePrice, defaultRegularPrice, modifierPrice) {

//    if ($("#modifier_selector_" + position + " input[type='checkbox'][name='chkselectedModifier']").length == 1) {
//        let modifiedPrice = 0.0;
//        if ($("#hdnSalePriceAvailable").val().toLowerCase() == "true") {
//            modifiedPrice = Number($("#salePrice1").text().substring(1).trim()) - modifierPrice;
//            $("#salePrice1").text("$" + modifiedPrice.toFixed(2));
//        }
//        else {
//            modifiedPrice = Number($("#regularPrice1").text().substring(1).trim()) - modifierPrice;
//            $("#regularPrice1").text("$" + modifiedPrice.toFixed(2));
//        }
//    }
//    else
//    {
//        setDefaultPrices(defaultSalePrice, defaultRegularPrice)
//    }

//    $("#modifier_selector_" + position).html($("#syncOptionModList #modifier_" + position).html());
//    $("#modifier_selector_" + position).children().show();
//    $("#rd_option_" + optionId).attr("checked", true);
//    $(".wrapper-modifier-selector td").each(function () {
//        if ($(this).hasClass('selected')) $(this).removeClass('selected');
//    });   

    
//}

//function loadArticleWindow(title, solution) {
//    debugger;
//    var html = "<div class='wrapper-issue-viwer'><h3>" + title + "</h3><div class='cleafix'></div><div class='col-lg-12 col-md-12 col-xs-12 mt-2 pl-0 pr-0 content-wrapper-viwer'>" + solution + "</div></div>"
//    commonpopupwindowNoButtons(html);
//}


function loadArticleWindow(title, solution) {
    var html1 = "<div class='text-left d-inline-block pl-3 pt-3'><h5 class='wrapper-product-header mb-0'>" + title + "</h5></div >" + "<button type='button' class='close' data-dismiss='modal'>&times;</button>"
    var html2 = "<div class='col-12 pb-3 content-wrapper-viwer'> <p>" + solution + "</p></div>"
    commonpopupwindowNoButtons(html1, html2);
}

function commonpopupwindowNoButtons(header, content) {

    $('#modalDispplayImageInfo').modal('show');
    $('#modalDispplayImageInfo .modal-header').html(header);
    $('#modalDispplayImageInfo .modal-body').html(content);
}

function SearchProducts()
{
    let searchKey = $("#txtSearch").val();

    if (searchKey == "") {
        alert("Please Enter a value to search!!");
    }
    else
    {
        window.location.href = "/Product/ProductSearchResults?searchkey=" + searchKey;
    }
}

function searchProductByEnter(e)
{
    var key = e.keyCode || e.which;
    if (key === 13) {
        SearchProducts();
    }
}

function triggerSearch(key)
{
    let applicationId = 0;
    if (customizeApplication.appId > 0)
    {
        applicationId = customizeApplication.appId;
    }
    $.ajax({
        type: 'POST',
        url: '/Product/SearchResults',
        data: { keyWord: key, applicationId:applicationId },

        success: function (data) {
            $(".wrapper-catelog").html(data);
        },
        error: function (data) {

        }
    });
}

function removeFilter()
{
    sessionStorage.clear();
    $(".icon-green").addClass("d-none");

    $.ajax({
        type: 'POST',
        url: '/Product/ClearApplicationSession',

        success: function (data) {
            //document.cookie = "cookieObject=";
            location.href = "../Application/ApplicationGuide"
        },
        error: function (data) {

        }
    });
    
}


function setAutoConfigurator(productId)
{
    if (customizeApplication.appId > 0) {
       
        $.ajax({
            type: 'POST',
            url: '/Application/GetApplicationProducts',
            data: { appId: customizeApplication.appId },
            success: function (data) {
                if (data != "") {
                    var item = JSON.parse(data).value;
                    item = item.map(function (item) {
                        return item.productId;
                    });

                    if ($.inArray(productId, item) != -1) {
                        $("#ddlYear").val(customizeApplication.appYear);
                        getConfiguratorCumstomization(productId);
                    }
                    else {

                        $("#ddlYear").val(-1);
                    }
                }
                else
                {
                    $("#ddlYear").val(-1);
                }
            },
            error: function (data) {

            }
        });
    }
}

//Configurator Customization

function getConfiguratorCumstomization(productId)
{

    $("#ddlYear").before(drawSelectionIndicator("ddlYear", true));
    $.ajax({
        type: 'POST',
        url: '/Product/GetMakesByYear',
        data: { year: $("#ddlYear").val(), productId: productId },

        success: function (data) {

            var defaultOptValue = "-1";
            var defaultOptName = "--Make--";
            var optionsValue = JSON.parse(data);
            var element = $("#ddlMake");


            $("#ddlMake").html('');
            if (typeof defaultOptValue !== 'undefined' && defaultOptName !== 'undefined') {
                element.append('<option value="' + defaultOptValue + '">' + defaultOptName + '</option>');
            }
            $("#ddlMake").attr("disabled", false);
            $.each(optionsValue.makes, function (k, item) {
                element.append('<option value="' + item + '">' + item + '</option>');
            });

            if (customizeApplication.appId > 0) {
                $("#ddlMake").val(customizeApplication.appMake);
            }
            if (optionsValue.length == 1) {
                $("#ddlMake").attr("disabled", true);
            }
            $("#ddlMake").focus();

            GetModelByMakeAndYearConfigurator($("#ddlYear").val(), $("#ddlMake").val(), productId);
        },
        error: function (data) {

        }
    });
}

function GetModelByMakeAndYearConfigurator(year, make, productId)
{
    if (make != "")
    {
        $("#ddlMake").before(drawSelectionIndicator("ddlMake", true));
        $.ajax({
            type: 'POST',
            url: '/Product/GetYearsByMakeAndModel',
            data: { year: year, make: make, productId: productId },

            success: function (data) {
 
                var defaultOptValue = "-1";
                var defaultOptName = "--Model--";
                var optionsValue = JSON.parse(data);
                var element = $("#ddlModel");


                $("#ddlModel").html('');
                if (typeof defaultOptValue !== 'undefined' && defaultOptName !== 'undefined') {
                    element.append('<option value="' + defaultOptValue + '">' + defaultOptName + '</option>');
                }
                $("#ddlModel").attr("disabled", false);
                $.each(optionsValue.models, function (k, item) {
                    element.append('<option value="' + item + '">' + item + '</option>');
                });

                if (customizeApplication.appId > 0) {
                    $("#ddlModel").val(customizeApplication.appModel);
                }
                if (optionsValue.length == 1) {
                    $("#ddlModel").attr("disabled", true);
                }
                $("#ddlModel").focus();
                $("#ddlModel").before(drawSelectionIndicator("ddlModel", true));

                GetSubModelByModel();
            },
            error: function (data) {

            }
        });
    }
}

function getItemAssets(from, skuId) {
    let method = "";
    let header = "";
    switch (from) {
        case "article": {
            method = "GetItemArticles";
            header = "Articles";
            break;
        }
        case "doc": {

            method = "GetItemDocuments";
            header = "Documents";
            break;
        }
        case "fitment": {
            method = "GetItemFitments";
            header = "Fitments";
            break;
        } case "part": {
            method = "GetItemAlternateParts";
            header = "Alternate Part Numbers";
            break;
        }
    }
    getItemAssetsData(method, skuId);
    $("#modalItemAssetContainer #itemAssetHdr").text(header);
    $("#itemAssetContainer").empty();
    $("#modalItemAssetContainer").modal('show');



    $("#modalItemAssetContainer .close , #modalItemAssetContainer .btn-select").click(function () {
        $("#modalItemAssetContainer").modal("hide");
    });
}

function getItemAssetsData(method, skuId) {
    $.ajax({
        type: 'POST',
        url: '/Item/' + method,
        data: { skuId: skuId },
        crossDomain: true,
        success: function (data) {
            $("#itemAssetContainer").html(data);
        },
        error: function (data) {
            $("#itemAssetContainer").html("<div class='col-12'><h2 class='empty-content'>No content</h2></div>");

        }
    });
}

function getApplicationFitments(productId, applicationId, applicationName)
{
    let appName = "";
    let productName = "";
    appName = applicationName;
    productName = $("#hdnProductName").val();

    let headerText = productName + " fitment for " + appName;

    $.ajax({
        type: 'POST',
        url: '/Application/GetApplicationFitments',
        data: { productId: productId, applicationId: applicationId },
        crossDomain: true,
        success: function (data) {
            $("#applicationFitmentAssetContainer").empty();
            $("#modalApplicationFitmentAssetContainer #applicationFitmentHdr").empty();
            $("#applicationFitmentAssetContainer").html(data);
            
            $("#modalApplicationFitmentAssetContainer #applicationFitmentHdr").text(headerText);
            $("#modalApplicationFitmentAssetContainer").modal('show');
        },
        error: function (data) {
            $("#applicationFitmentAssetContainer").html("<div class='col-12'><h2 class='empty-content'>No content</h2></div>");

        }
    });
}


function submitInquiry()
{
    let fname = $("#fname").val();
    let lname = $("#lname").val();
    let email = $("#email").val();
    let phone = $("#phone").val();
    let comment = $("#subject").val();

    if (formValidator('frmContactInquiry')) {
        if (!validateContactInquiryFields(fname, lname, email, phone, comment)) {
            generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>" + errors + "</p>", null, null, 2500);
            return false;
        }

        let items = new ContactInquiryFactory(fname, lname, email, phone, comment);

        $.post("/Pages/ContactInquiry", { contactInquiryItems: items }, function (data) {

            if (data.isSuccess) {
                generalHandlers.loadSimpleMessage(1, "<p class='mb-0'>The inquiry has been sent successfully. We will get back to you within 24 hours.</p>", null, null, 2500);
            }
            else {
                generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Something went wrong</p>", null, null, 2500);
            }
        }).fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            alert("Request Failed: " + err);
        });


    }
}

function formValidator(formId) {

    return $("#" + formId).valid();
}

function validateContactInquiryFields(fname, lname, email, phone, comment)
{
    errors = "";
    if (!/^[a-zA-Z]*$/g.test(fname))
    {
        errors = "Please enter valid First Name";
        return false;
    }

    if (!/^[a-zA-Z]*$/g.test(lname)) {
        errors = "Please enter valid Last Name";
        return false;
    }

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        errors = "Invalid Email Address";
        return false;
    }

    if (phone != "" && !/^(1\s|1|)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-|\s)?(\d{4})$/.test(phone)) {
        errors = "Invalid Phone Number";
        return false;
    }

    if (comment == "")
    {
        errors = "Comment section Cannot be empty";
        return false;
    }

    return true;
       
}

function ContactInquiryFactory(fname, lname, email, phone, comment)
{
    this.firstName = fname;
    this.lastName = lname;
    this.email = email;
    this.phone = phone;
    this.salesOpportunityDescription = comment;
}


function changeqtyddl(sku, e) {
    let productId = $("#hdnProductId").val();
    $.post("/Product/GetProductItemMapping", { productId: productId, itemId: sku }, function (data) {
        if (data != null) {
            if ($(e).is(":checked"))
                $("#qty_" + sku).val(data.quantity);
            else
                $("#qty_" + sku).val(data.quantity);
        }
        else {
            $("#qty_" + sku).val(0);
        }
        
            
    }).fail(function (jqxhr, textStatus, error) {
        var err = textStatus + ", " + error;
        alert("Request Failed: " + err);
    }); 
}


function recalculateSkuPrice(obj, sku) {
    if ($(obj).val() > 0) $("#chk_" + sku).prop("checked", true);
    else $("#chk_" + sku).prop("checked", false);
}

function reloadProductDiagramImageWithHotsPot(productId, productTypeId, imageUrl)
{

    if (productTypeId == 3)
    {
        $.post("/Product/GetDiagramHotspotMappings", { productId: productId}, function (data) {
            var imgWidth = null;
            var imgHeight = null;
            if (data.details.length > 0) {
                imgWidth = Number(data.details[0].alterText.split("|")[0])
                imgHeight = Number(data.details[0].alterText.split("|")[1]);
            }

            if (imgWidth == 0) imgWidth = "";
            else imgWidth = "width='" + imgWidth + "'";

            var data = data;
            var srcmidstr = imageUrl.split("/")[3];
            var imgData = imageUrl.replace(srcmidstr, "originals");
            var tmpImgWrapper = "<div><div id='tmpImgWrapperSrc' style='display:inline-block;'><img src='" + imgData + "' " + imgWidth + "></div></div>"
            $("body").append(tmpImgWrapper);

            $("#tmpImgWrapperSrc img").on("load", function () {
                imgHeight = this.height;
                imgWidth = this.width;
                $("#tmpImgWrapperSrc").remove();
                if (this.width > 700) imgWidth = 700;
                else imgWidth = this.width;

                var textObject = "";

                for (var i = 0; i < data.details.length; i++) {
                    switch (data.details[i].type) {
                        case 1:
                            textObject += '<a onClick="navigateThroughDiagram(' + data.details[i].diagramId + ')" id="#dig_' + data.details[i].diagramId + '" class="scroll-map-items"><rect x="' + data.details[i].left + '" y="' + data.details[i].top + '" fill="rgb(104, 124, 242)" opacity="0.4" width="' + data.details[i].width + '"  stroke-width="0.5" stroke="red" height="' + data.details[i].height + '" /></a>';
                            break;
                        case 0:
                            textObject += '<a onClick="navigateThroughDiagram(' + data.details[i].diagramId + ')" id="#dig_' + data.details[i].diagramId + '" class="scroll-map-items"><circle cx="' + (data.details[i].left + data.details[i].radius) + '" cy="' + (data.details[i].top + data.details[i].radius) + '" r="' + data.details[i].radius + '" stroke-width="0.5"  fill="rgb(104, 124, 242)" stroke="red" opacity="0.4" /></a>';
                            break;
                    }
                }
                var tempViewBox = "0 0 " + imgWidth + " " + imgHeight;
                var svgType = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="' + tempViewBox + '" style="background : url(' + imgData + ') 0% 0% no-repeat;background-size: 100%;" ><image width="' + imgWidth + '" height="' + imgHeight + '" xlink:href=""></image>'
                    + textObject
                    + '</svg>';

                $("#wrapperImgObject").html('<div class="wrp-map-img" style="width:' + imgWidth + 'px;height:' + imgHeight + 'px">' + svgType + '</div>');

                $(".scroll-map-items").click(function () {
                    var tempItemDiv = $(this).attr('id');
                    $(tempItemDiv).addClass(" section-activ", 1000);
                    setTimeout(function () {
                        $(tempItemDiv).removeClass(" section-activ", 1000);
                    }, 2500);
                });
            });

        }).fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            alert("Request Failed: " + err);
        }); 
    }
    
}

function navigateThroughDiagram(diagramId)
{
    $('html, body').animate({ scrollTop: $('#dig_' + diagramId).offset().top - 200 }, 100);
}

function setCumstomizationData1(obj) {

    let make = $("#ddlMakeCustomization1").val();
    let model = $("#ddlModelCustomization1").val();

    if (make != "" && model != "" && $(obj).val() != -1) {
        $.ajax({
            type: 'GET',
            url: '/Account/GetAllApplicationByYMM',
            //data: { year: $("#ddlYearCustomization").val(), make: $("#ddlMakeCustomization").val(), model: $("#ddlModelCustomization").val() },
            data: { year: $(obj).val(), make: make, model: model },
            crossDomain: true,
            success: function (data) {

                if (data != null) $("#divVehicleDetails").html(data);
            },
            error: function (data) {
                customizeApplication.appId = 0;
                customizeApplication.appName = "";
            }
        });
    }

}

function redirectWithAccountCustomization(year, make, model)
{
    if (make != "" && model != "" && year != -1) {
        $.ajax({
            type: 'POST',
            url: '/Product/GetApplicationByYMM',
            data: { year: year, make: make, model: model },
            crossDomain: true,
            success: function (data) {
                let item = JSON.parse(data).value;               

                customizeApplication.appId = item[0].applicationId;
                customizeApplication.applicationSlug = item[0].slug;
                customizeApplication.appName = item[0].applicationName;
                customizeApplication.appYear = item[0].year;
                customizeApplication.appMake = item[0].make;
                customizeApplication.appModel = item[0].model;

                var jsonString = JSON.stringify(customizeApplication);
                sessionStorage.setItem("currentAppFilter", jsonString);

                if (sessionStorage.getItem('currentAppFilter').length > 0) {
                    $(".icon-green").removeClass("d-none");
                }
                else {
                    $(".icon-green").addClass("d-none");
                }
                
                window.location.href = "/" + customizeApplication.applicationSlug;
            },
            error: function (data) {
                customizeApplication.appId = 0;
                customizeApplication.appName = "";
            }
        });
    }
}

function selectProductModifier(optionId, modifierName, image, optionName, modifierId, instanceId, modifierPrice,counter)
{
    //let originalSalePrice = Number($("#hdnSalePrice").val().trim());
    //let originalRegularPrice = Number($("#hdnRegularPrice").val().trim());
    let newPrice = 0.0;
    let salePrice = Number($("#salePrice1").text().substring(1).trim());
    let regularPrice = Number($("#regularPrice1").text().substring(1).trim());


    $('#modifier_' + counter + '').find('input[type=radio]:checked').prop('checked', false);
    let preModPrice = Number($('#modifier_' + counter + ' .modifier-option-selector #preModifierPrice').val());
    $('#modifier_' + counter + ' .modifier-option-selector #preModifierPrice').val(modifierPrice);
    //$('#modifier_' + counter + ' #testMod_' + optionId + '#rd_option_' + optionId).html("<input type='radio' checked='checked' id='rd_option_'"+ optionId +"' instanceId='" + instanceId + "' modifierid='" + modifierId + "'  optionId='" + optionId + "' modifierName='" + modifierName + "' optionName='" + optionName + "' modifierPrice='" + modifierPrice + "'/>")
    //$('#modifier_' + counter + ' #testMod_' + optionId + ' #rd_option_' + optionId + '').attr("checked", "checked");
    $('#modifier_' + counter + ' #testMod_' + optionId + ' #rd_option_' + optionId + '').prop("checked", true);
    $('#modifier_' + counter + ' #testMod_' + optionId + ' #rd_option_' + optionId + '').attr("instanceId", instanceId);
    $('#modifier_' + counter + ' #testMod_' + optionId + ' #rd_option_' + optionId + '').attr("optionId", optionId);
    $('#modifier_' + counter + ' #testMod_' + optionId + ' #rd_option_' + optionId + '').attr("modifierId", modifierId);
    $('#modifier_' + counter + ' #testMod_' + optionId + ' #rd_option_' + optionId + '').attr("modifierName", modifierName);
    $('#modifier_' + counter + ' #testMod_' + optionId + ' #rd_option_' + optionId + '').attr("optionName", optionName);
    $('#modifier_' + counter + ' #testMod_' + optionId + ' #rd_option_' + optionId + '').attr("modifierPrice", modifierPrice);

   
    $('#modifier_' + counter + ' .modifier-option-selector').removeClass('option-selected');
    $('#modifier_' + counter + ' #testMod_' + optionId + '').addClass('option-selected');


    if ($("#hdnSalePriceAvailable").val().toLowerCase() == "true") {
            newPrice = salePrice + modifierPrice - preModPrice;
            $("#salePrice1").text("$" + newPrice.toFixed(2));
        }
        else {
            newPrice = regularPrice + modifierPrice - preModPrice;
            $("#regularPrice1").text("$" + newPrice.toFixed(2));
        } 
}


function Reset() {

    $.ajax({
        type: 'GET',
        url: '/Home/Reset',
        data: {},
        crossDomain: true,
        success: function (data) {
            location.href="../ApplicationGuide"
        }
    })
}