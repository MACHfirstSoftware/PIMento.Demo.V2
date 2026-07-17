var promotional = function () {
    function getColorBySize()
    {
        $('#ddlColor').empty();
        $('#ddlColor').html('<option value="-1">-- Color --</option>');
        drawSelectionIndicator("ddlColor");
        if (!$("#divStyle").hasClass('d-none')) $("#divStyle").addClass('d-none');
        debugger;
        $("#ddlSize").focus();
        //if (!$("#divColor").hasClass('d-none')) $("#divColor").addClass('d-none');
        debugger;
        $("#divPromoItemDetails").empty();
        
        let productId = $('#hdnProductId').val() == "" || null ? 0 : $('#hdnProductId').val();
        if ($('#ddlSize').val() != -1) {

            $.ajax({
                type: 'GET',
                url: '/Product/GetItemsBySize',
                data: { productId: productId, size: $('#ddlSize').val() },
                crossDomain: true,
                success: function (data) {
                    //$("#ddlSize").before(drawSelectionIndicator("ddlSize", true))
                    drawSelectionIndicator("ddlSize");
                    debugger;
                    if (data != null) {
                        if (data.length == 1) {
                            checkForItem(data, true);
                        }
                        else if (data.length > 1) {
                            $('#ddlColor').removeAttr("disabled");
                            bindToDropdown("ddlColor", data, "-1", "-- Color --");
                        }

                    }

                },
                error: function (data) {


                }
            });
        }
        else
        {
            drawSelectionIndicator("ddlSize");
            drawSelectionIndicator("ddlColor");
        }
        
    }


    function getItemsBySizeAndColor() {
        debugger;
        if (!$("#divStyle").hasClass('d-none')) $("#divStyle").addClass('d-none');
        $('#ddlStyle').empty();
        $('#ddlStyle').html('<option value="-1">-- Style --</option>');
        drawSelectionIndicator("ddlStyle");
        //$("#ddlColor").before(drawSelectionIndicator("ddlColor", false))
        $("#divPromoItemDetails").empty();
        $("#ddlSize").focus();
        let productId = $('#hdnProductId').val() == "" || null ? 0 : $('#hdnProductId').val();
        if ($('#ddlSize').val() != -1 && $('#ddlColor').val() != -1) {
            $.ajax({
                type: 'GET',
                url: '/Product/GetItemsBySizeAndColor',
                data: { productId: productId, size: $('#ddlSize').val(), color: $('#ddlColor').val() },
                crossDomain: true,
                success: function (data) {
                    debugger;
                    if (data != null) {
                        debugger;
                        let styleArray = [];

                        for (var i = 0; i < data.length; i++) {
                            if (data[i].style != null && data[i].style != "") styleArray.push(data[i]);
                        }

                        drawSelectionIndicator("ddlColor");
                        //$("#ddlColor").before(drawSelectionIndicator("ddlColor", true))
                        if (styleArray.length == 0) {

                            checkForItem(data, false);
                        }
                        else {
                            $('#divStyle').removeClass("d-none");
                            $('#ddlStyle').removeAttr("disabled");
                            bindToDropdown("ddlStyle", styleArray, "-1", "-- Size --");
                        }
                    }

                },
                error: function (data) {


                }
            });
        }
        else
        {
            if ($('#ddlColor').val() == -1)
            {
                drawSelectionIndicator("ddlColor");
                drawSelectionIndicator("ddlStyle");
            } 
        }
    }

    function getItemsBySizeColorAndStyle()
    {
        $("#divPromoItemDetails").empty();
        $("#ddlStyle").focus();
        let productId = $('#hdnProductId').val() == "" || null ? 0 : $('#hdnProductId').val();
        if ($('#ddlSize').val() != -1 && $('#ddlColor').val() != -1 && $('#ddlStyle').val() != -1) {
            $.ajax({
                type: 'GET',
                url: '/Product/GetItemsBySizeColorAndStyle',
                data: { productId: productId, size: $('#ddlSize').val(), color: $('#ddlColor').val(), style: $('#ddlStyle').val() },
                crossDomain: true,
                success: function (data) {
                    debugger;
                    if (data != null) {
                        drawSelectionIndicator("ddlStyle");
                        //$("#ddlStyle").before(drawSelectionIndicator("ddlStyle", true))
                        checkForItem(data, false);
                    }

                },
                error: function (data) {


                }
            });
        }
        else
        {
            if ($('#ddlStyle').val() == -1) drawSelectionIndicator("ddlStyle");
        }
    }

    return {
        getColorBySize: getColorBySize,
        getItemsBySizeAndColor: getItemsBySizeAndColor,
        getItemsBySizeColorAndStyle: getItemsBySizeColorAndStyle
    };
}();

//function drawSelectionIndicator(id, isVisible) {
//    if ($("#indicator_" + id).length == 0 || $("#" + id).val() == -1) {
//        var visibilty = "hidden";
//        if (isVisible) visibilty = "";
//        return "<span id='indicator_" + id + "'" + visibilty + " class='wrapper-status-done'> <i class='fa fa-check-circle text-success' ></i></span>"
//    }
//    else return "";
//}

function drawSelectionIndicator(id)
{
    debugger;
    if ($("#" + id).val() == -1) {
        if (!$("#indicator_" + id).hasClass('d-none')) $("#indicator_" + id).addClass('d-none');
    }
    else
    {
        $("#indicator_" + id).removeClass('d-none');
    }
}


function bindToDropdown(id, options, defaultOptValue, defaultOptName) {
    debugger;
    var tempArr = [];
    var optionsValue = options;
    var element = $("#" + id);
    $("#" + id).html('');
    if (typeof defaultOptValue !== 'undefined' && defaultOptName !== 'undefined') {
        element.append('<option value="' + defaultOptValue + '">' + defaultOptName + '</option>');
    }
    $.each(optionsValue, function (k, item) {
        debugger;
        if (id == "ddlColor") {
            if (!tempArr.includes(item.color)) {
                element.append('<option value="' + item.color + '">' + item.color + '</option>');
                tempArr.push(item.color);
            }

        }
        else if (id == "ddlStyle")
        {
            if (!tempArr.includes(item.style)) {
                element.append('<option value="' + item.style + '">' + item.style + '</option>');
                tempArr.push(item.style);
            }
        } 

    });
    $("#" + id).focus();
}

function regeneratePromotionalDropdowns(obj) {
    debugger;
    if (obj[0].color != null) {
        $('#ddlColor').removeAttr("disabled");
        $('#ddlColor').empty();
        $('#ddlColor').append('<option value="' + obj[0].color + '" selected>' + obj[0].color + '</option>');
        //$("#ddlColor").before(drawSelectionIndicator("ddlColor", true))
        drawSelectionIndicator("ddlColor");
    }

    if (obj[0].style != null) {
        $('#divStyle').removeClass("d-none");
        $('#ddlStyle').empty();
        $('#ddlStyle').removeAttr("disabled");
        $('#ddlStyle').append('<option value="' + obj[0].style + '" selected>' + obj[0].style + '</option>');
        //$("#ddlStyle").before(drawSelectionIndicator("ddlStyle", true))
        drawSelectionIndicator("ddlStyle");
    }


}

function checkForItem(json, isfilterd, obj) {
    debugger;

    let hasItems = false;
    let itemsArray = [];
    let itemImageCurserClass = "cursor-pointer";

    if (json != undefined) {
        itemsArray = json;
        hasItems = true;
    }

    if (isfilterd) {
        regeneratePromotionalDropdowns(itemsArray)
    }

    //-----------------draw items--------------//
    if (hasItems) {
        debugger;

        //let subModel = "";
        //let trim = "";
        //let position = "";
        let qtyHeader = "Quantity";

        let isSalePriceAvailable = false;
        let regularPrice = '0.00';
        let salePrice = '0.00';

        let formattedPrice = '0.00';
        //let additionalNotes = "";

        debugger;
        //if (json.subModel != null) subModel = " - " + json.subModel;
        //if (json.trim != null) trim = " - " + json.trim;
        //if (json.position != null) position = " - " + json.position;

        //let productItems = "<div class='table-responsive'><table class='table table-bordred table-striped' id='tbProductItem'><thead><tr class='mobile-tr'><th scope='col' class='col_0'>Item Number</th><th scope='col' class='col_5'>Description</th>" +
        //    "<th scope = 'col' class='col_0 text-right' > Price</th> <th scope='col' class='col_4 pl-4'>Quantity</th> <th></th>";
        let productItems = "<div class='table-responsive'><table class='table table-bordred table-striped' id='tbProductItem'><thead><tr class='mobile-tr cus-table-products'><th scope='col' class='item-no pl-0'>Item Number</th><th scope='col' class='d-none'>Description</th>" +
            "<th scope = 'col' class=' text-left' > Price</th> <th scope='col' class='text-right pr-0'>Quantity</th>";

        for (var I = 0; I < itemsArray.length; I++) {
            if (itemsArray[I].itemPricing[I] != null) {
                regularPrice = formatPrice(itemsArray[I].itemPricing[I].price);
                if (itemsArray[I].itemPricing[I].isOnSale && new Date(itemsArray[I].itemPricing[I].saleStartDate) <= new Date() && (itemsArray[I].itemPricing[I].saleEndDate == null || new Date(itemsArray[I].itemPricing[I].saleEndDate) > new Date())) {

                    salePrice = formatPrice(itemsArray[I].itemPricing[I].salePrice);
                    isSalePriceAvailable = true;
                }
            }

            //formattedPrice = formatPrice(itemsArray[I].suggestedPrice);
            //if (itemsArray[I].notes != null) additionalNotes = itemsArray[I].notes + "</br>";
            //if (itemsArray[I].label != null) additionalNotes += itemsArray[I].label;
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

            if (itemsArray[I].isObsolete) {
                qtyHtml = "<td class='quantity item-input text-right pr-0' data-label='Quantity: &nbsp;'> <div class='float-right'> <div class='float-right'> Discontinued </div></td>"
            }
            else {
                hasQty = true;
                itemsArray[I].maxQuantity = itemsArray[I].maxQuantity == 0 ? 100 : itemsArray[I].maxQuantity;

                if (itemsArray[I].calculateInventory == 0) {
                    hasQty = true;
                }
                else if (itemsArray[I].calculateInventory == 1) {
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
                if (itemsArray[I].calculateInventory == 0 || itemsArray[I].quantityInStock != 0) {
                    for (var i = defaultQTY; i <= maxQTY; i++) {
                        if (qtyMultiplier == 1) {
                            qtySelectorValue = i;
                        }
                        else if (i % qtyMultiplier == 0) {
                            qtySelectorValue = i;
                        }
                    }
                    qtyHtml = "<td class='quantity item-input text-right pr-0' data-label='Quantity: &nbsp;'> <div class='float-right'> <div class='float-right ml-md-3 quantity-new float-lg-left'> <input type='number' style='display: none;' class='buttons-only qty-collector w-58 px-2 text-center float-left' id='qty_" + itemsArray[I].itemId + "' skuId='" + itemsArray[I].itemId + "' value='0' min='0' max='" + qtySelectorValue + "' maxQty='" + qtySelectorValue + "' /> </div></td>";

                }
            }
            else {
                if (itemsArray[I].inventoryMessage == null || itemsArray[I].inventoryMessage == "") {
                    qtyHtml = "<td class='quantity item-input text-right pr-0' data-label='Quantity: &nbsp;'> <div class='float-right'> <div class='float-right'> <label>Out of stock</label> </div></td>"
                }
                else {
                    qtyHtml = "<td class='quantity item-input text-right pr-0' data-label='Quantity: &nbsp;'> <div class='float-right'> <div class='float-right'> <label> " + itemsArray[I].inventoryMessage + "</label> </div></td>"
                }
            }

            if (isSalePriceAvailable) {
                productItems += "<tr><td class='pt-2 font-13px font-weight-bold pl-0' data-label='Item Number: &nbsp;'>" + itemsArray[I].itemNumber + "</td><td class='pt-2 d-none' data-label='Description: &nbsp;'>" + itemsArray[I].itemDetails + "</br></td>" +
                    "<td class='pt-2 text-left font-13px font-weight-bold' data-label='Price: &nbsp;'><span class='w-100 d-inline-block text-decoration-line-through'> " + regularPrice + "/" + itemsArray[I].units + " </span><span class='w-100 d-inline-block'> " + salePrice + "/" + itemsArray[I].units + " </span></td>" + qtyHtml;
            }
            else {
                productItems += "<tr><td class='pt-2 font-13px font-weight-bold pl-0' data-label='Item Number: &nbsp;'>" + itemsArray[I].itemNumber + "</td><td class='pt-2 d-none' data-label='Description: &nbsp;'>" + itemsArray[I].itemDetails + "</br></td>" +
                    "<td class='pt-2 text-left font-13px font-weight-bold' data-label='Price: &nbsp;'>" + regularPrice + "/" + itemsArray[I].units + "</td>" + qtyHtml;

            }

        }
        debugger;
        //if (itemsArray.length > 0)
        //{
        //    PutCurrentProductDetailsInSession(itemsArray);
        //}

        //productItems += "<td><div class='col-12 text-right'> <button type='button' class='common-orange-button px-4' onclick='orderEntry.addToBucket()'>Add to Cart</button></div>";
        //productItems += "</td></tr></tbody></table></div>";

        productItems += "</tr></tbody></table></div>";
        productItems += "<div class='col-12 text-center px-0 mt-3'> <button type='button' class='common-orange-button px-4 py-3 w-100' onclick='orderEntry.addToBucket()'>Add to Cart</button></div>";

        //----show modifiers
        //beginShowModifiers();

        $("#divPromoItemDetails").html(productItems);
        $(".buttons-only").inputSpinner({ buttonsOnly: true });
        //$("input[type='number']").inputSpinner();
    }
    else {
        $("#divPromoItemDetails").empty();
    }
}