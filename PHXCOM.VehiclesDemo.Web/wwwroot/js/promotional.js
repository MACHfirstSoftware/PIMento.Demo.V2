var promotional = function () {

    function getColorBySize(count) {

        $('#ddlColor').empty();
        $('#ddlStyle').empty();
        if (!$("#divColor").hasClass('d-none')) $("#divColor").addClass('d-none');
        if (!$("#divStyle").hasClass('d-none')) $("#divStyle").addClass('d-none');
        $("#divProShopItemDetails").empty();
        $('input:radio[name=sizeRadioGroup]').each(function () { $(this).prop('checked', false); });
        $("#size_" + count).prop("checked", true);
        let productId = $('#hdnProductId').val() == "" || null ? 0 : $('#hdnProductId').val();

        if ($("input[name=sizeRadioGroup]").is(":checked")) {

            $.ajax({
                type: 'GET',
                //url: '/Product/GetItemsBySize',
                url: '/Product/CallProShopConfigurator',
                data: { productId: productId, size: $("input[name=sizeRadioGroup]:checked").val() },
                crossDomain: true,
                success: function (data) {
                    debugger;
                    if (data != null) {
                        $('#divColor').removeClass("d-none");
                        if (data.length == 1) {
                            checkForItem(data, true);
                        }
                        else if (data.length > 1) {
                        
                            bindToDiv("ddlColor", data);
                        }

                    }

                },
                error: function (data) {


                }
            });
        }

    }

    function bindToDiv(id, options) {
        var tempArr = [];
        var optionsValue = options;
        var element = $("#" + id);
        $("#" + id).html('');
        var count = 1;
        $.each(optionsValue, function (k, item) {
            if (id == "ddlColor") {
                if (!tempArr.includes(item.color)) {
                    element.append('<span><input type="radio" id="color_' + count + '" name="colorRadioGroup" value="' + item.color + '" onclick="promotional.getItemsBySizeAndColor(' + count + ')"/> <label for="color_' + count + '"  class="size-btn"> ' + item.color + '  </label></span>');
                    tempArr.push(item.color);
                }

            }
            else if (id == "ddlStyle") {
                if (!tempArr.includes(item.style)) {
                    element.append(' <input type="radio" id="style_' + count + '" name="styleRadioGroup" value="' + item.style + '" onclick="promotional.getItemsBySizeColorAndStyle(' + count + ')"/> <label for="style_' + count + '"  class="size-btn"> ' + item.style + '  </label>');
                    tempArr.push(item.style);
                }
            }
            count++;
        });
    }

    function getItemsBySizeAndColor(count) {
        if (!$("#divStyle").hasClass('d-none')) $("#divStyle").addClass('d-none');
        $('#ddlStyle').empty();
        $("#divProShopItemDetails").empty();
        $("#color_" + count).prop("checked", true);
        let productId = $('#hdnProductId').val() == "" || null ? 0 : $('#hdnProductId').val();
        if ($("input[name=sizeRadioGroup]").is(":checked") && $("input[name=colorRadioGroup]").is(":checked")) {
            $.ajax({
                type: 'GET',
                //url: '/Product/GetItemsBySizeAndColor',
                url: '/Product/CallProShopConfigurator',
                data: { productId: productId, size: $("input[name=sizeRadioGroup]:checked").val(), color: $("input[name=colorRadioGroup]:checked").val() },
                crossDomain: true,
                success: function (data) {
                    if (data != null) {
                        let styleArray = [];

                        for (var i = 0; i < data.length; i++) {
                            if (data[i].style != null && data[i].style != "") styleArray.push(data[i]);
                        }
                    
                        if (styleArray.length == 0) {

                            checkForItem(data, false);
                        }
                        else if (styleArray.length == 1) {
                            //$('#divStyle').removeClass("d-none");
                            checkForItem(data, true);
                        }
                        else if (styleArray.length > 1) {
                            $('#divStyle').removeClass("d-none");
                            //$('#ddlStyle').removeAttr("disabled");
                            bindToDiv("ddlStyle", styleArray);
                        }
                    }

                },
                error: function (data) {


                }
            });
        }
    }

    function regeneratePromotionalDivs(obj) {
        if (obj[0].color != null && ($("input[name=colorRadioGroup]").length == 1 || $("input[name=colorRadioGroup]").length == 0)) {
            $('#ddlColor').empty();
            $('#ddlColor').append('<input type="radio" checked id="selectColor" name="colorRadioGroup" value="' + obj[0].color + '" />');
            $('#ddlColor').append('<label for="selectColor" class="size-btn"> ' + obj[0].color + '  </label>')
        }

        if (obj[0].style != null && ($("input[name=styleRadioGroup]").length == 1 || $("input[name=styleRadioGroup]").length == 0)) {
            if (obj[0].style != "None" && obj[0].style != "") {
                $('#divStyle').removeClass("d-none");
                $('#ddlStyle').empty();
                $('#ddlStyle').append('<input type="radio" checked id="selectStyle" name="styleRadioGroup" value="' + obj[0].style + '" />');
                $('#ddlStyle').append('<label for="selectStyle" class="size-btn"> ' + obj[0].style + '  </label>')
            }

        }


    }

    function checkForItem(json, isfilterd, obj) {

        let hasItems = false;
        let itemsArray = [];
        let itemImageCurserClass = "cursor-pointer";

        if (json != undefined) {
            itemsArray = json;
            hasItems = true;
        }

        if (isfilterd) {
            regeneratePromotionalDivs(itemsArray)
        }

        //-----------------draw items--------------//
        if (hasItems) {

            let qtyHeader = "Quantity";

            let isSalePriceAvailable = false;
            let regularPrice = '0.00';
            let salePrice = '0.00';
            let qtyHtml = "";
            let formattedPrice = '0.00';


            let productItems = "<h5 class='quantity item-input d-inline-block w-100 section-sub-title mb-3'> QUANTITY </h5> ";
            //let productItems = "<div class='table-responsive px-0'><table class='table table-bordred table-striped' id='tbProductItem'><thead><tr class='mobile-tr cus-table-products'><th scope='col' class='item-no pl-0'>Item Number</th><th scope='col' class='d-none'>Description</th>" +
            //    "<th scope = 'col' class=' text-left' > Price</th> <th scope='col' class='text-right pr-0'>Quantity</th>";

            for (var I = 0; I < itemsArray.length; I++) {
                if (itemsArray[I].pricing[I] != null) {
                    regularPrice = formatPrice(itemsArray[I].pricing[I].price);
                    if (itemsArray[I].pricing[I].isOnSale && new Date(itemsArray[I].pricing[I].saleStartDate) <= new Date() && (itemsArray[I].pricing[I].saleEndDate == null || new Date(itemsArray[I].pricing[I].saleEndDate) > new Date())) {

                        salePrice = formatPrice(itemsArray[I].pricing[I].salePrice);
                        isSalePriceAvailable = true;
                    }
                }

                if (itemsArray[I].itemImage == "" || itemsArray[I].itemImage == null) {
                    itemsArray[I].itemImage = "";
                    itemImageCurserClass = "cursor-pointer-false";
                }
                else itemImageCurserClass = "cursor-pointer";

                let itemImg = "";
                if (itemsArray[I].itemImage != "") itemImg = "<img class='" + itemImageCurserClass + "' src='" + itemsArray[I].itemImage.replace(/'/g, "'") + "' onclick='previewItemImage(this)'  />";
                else itemImg = "";

                
                let hasQty = true;
                let qtyMultiplier = 1;
                let defaultQTY = 1;
                let maxQTY = 10;

                if (itemsArray[I].isObsolete) {
                    qtyHtml = "<div class='col-5 float-left pl-0 no-quantity'> Discontinued </div>"
                    //qtyHtml = "<td class='quantity item-input text-right pr-0' data-label='Quantity: &nbsp;'> <div class='float-right'> <div class='float-right'> Discontinued </div></td>"
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
                        //qtyHtml = "<td class='quantity item-input text-right pr-0' data-label='Quantity: &nbsp;'> <div class='float-right'> <div class='float-right ml-md-3 quantity-new float-lg-left'> <input type='number' style='display: none;' class='buttons-only qty-collector w-58 px-2 text-center float-left' id='qty_" + itemsArray[I].itemId + "' skuId='" + itemsArray[I].itemId + "' value='0' min='0' max='" + qtySelectorValue + "' maxQty='" + qtySelectorValue + "' /> </div></td>";
                        qtyHtml = "<div class='col-5 float-left pl-0 quantity-selector'> <input type='number' style='display: none;' class='buttons-only qty-collector w-58 px-2 text-center float-left' id='qty_" + itemsArray[I].itemId + "' skuId='" + itemsArray[I].itemId + "' value='0' min='1' max='" + qtySelectorValue + "' maxQty='" + qtySelectorValue + "' /> </div>"
                    }
                }
                else {
                    if (itemsArray[I].inventoryMessage == null || itemsArray[I].inventoryMessage == "") {
                        //qtyHtml = "<td class='quantity item-input text-right pr-0' data-label='Quantity: &nbsp;'> <div class='float-right'> <div class='float-right'> <label>Out of stock</label> </div></td>"
                        qtyHtml = "<div class='col-5 float-left pl-0 no-quantity'> Out of stock </div>"
                    }
                    else {
                        //qtyHtml = "<td class='quantity item-input text-right pr-0' data-label='Quantity: &nbsp;'> <div class='float-right'> <div class='float-right'> <label> " + itemsArray[I].inventoryMessage + "</label> </div></td>";
                        qtyHtml = "<div class='col-5 float-left pl-0 inventory-message'>" + itemsArray[I].inventoryMessage + "</div>"
                    }
                }

                $(".product-price").empty();
                if (isSalePriceAvailable) {
                    //productItems += "<tr><td class='pt-2 font-13px font-weight-bold pl-0' data-label='Item Number: &nbsp;'>" + itemsArray[I].itemNumber + "</td><td class='pt-2 d-none' data-label='Description: &nbsp;'>" + itemsArray[I].itemDetails + "</br></td>" +
                    //    "<td class='pt-2 text-left font-13px font-weight-bold' data-label='Price: &nbsp;'><span class='w-100 d-inline-block text-decoration-line-through'> " + regularPrice + "/" + itemsArray[I].units + " </span><span class='w-100 d-inline-block'> " + salePrice + "/" + itemsArray[I].units + " </span></td>" + qtyHtml;
                   
                    $(".product-price").html("<span class='float-left mr-2 text-decoration-line-through'> " + regularPrice + "/" + itemsArray[I].units + " </span><span class='float-left'> " + salePrice + "/" + itemsArray[I].units + " </span>");
                }
                else {
                    //productItems += "<tr><td class='pt-2 font-13px font-weight-bold pl-0' data-label='Item Number: &nbsp;'>" + itemsArray[I].itemNumber + "</td><td class='pt-2 d-none' data-label='Description: &nbsp;'>" + itemsArray[I].itemDetails + "</br></td>" +
                    //    "<td class='pt-2 text-left font-13px font-weight-bold' data-label='Price: &nbsp;'>" + regularPrice + "/" + itemsArray[I].units + "</td>" + qtyHtml;
                    $(".product-price").html("<span class='w-100 d-inline-block'> " + regularPrice + "/" + itemsArray[I].units + " </span>");
                }

      
                if (itemsArray[I].itemImage != null && itemsArray[I].itemImage != "")
                {
                    //var encodedImageUrl = encodeURI(itemsArray[I].itemImage);
                    //var encodedImageUrl = itemsArray[I].itemImage.replace(/'/g, "'");
                    
                    $("#productImagePreviewContainer #zoom_03").attr('src', itemsArray[I].itemImage);
                    $("#productImagePreviewContainer #zoom_03").attr('data-zoom-image', itemsArray[I].itemImage);
                    $('.zoomContainer .zoomWindowContainer div').css('background-image', 'none');
                    $('.zoomContainer .zoomWindowContainer div').css({ 'background-image': "url(" + itemsArray[I].itemImage.replace(/\'/g, '%27') + ")" });
                    $('.zoomWrapper .zoom-img').height($('.zoomWrapper').height());
                    if ($(window).width() <= '991') {
                        $('.zoomLens').css({ 'background-image': "url(" + itemsArray[I].itemImage.replace(/\'/g, '%27') + ")" });
                    }
                } 
            }

            productItems += qtyHtml;
            productItems += "<div class='col-7 float-left pr-0'> <button type='button' class='btn btn-green px-4 py-1 w-100' onclick='orderEntry.addToBucket()'>Add to Cart</button></div>";
            //productItems += "</tr></tbody></table></div>";
            //productItems += "<div class='col-12 text-center px-0 mt-3'> <button type='button' class='btn btn-danger rounded-0 px-4 font-18 w-100' onclick='orderEntry.addToBucket()'>Add to Cart</button></div>";

            //----show modifiers
            //beginShowModifiers();

            $("#divProShopItemDetails").html(productItems);
            $('#divProShopItemDetails').removeClass('d-none');
            $(".buttons-only").inputSpinner({ buttonsOnly: true });
        }
        else {
            $("#divProShopItemDetails").empty();
        }
    }

    function getItemsBySizeColorAndStyle(count) {
        $("#divProShopItemDetails").empty();
        $("#style_" + count).prop("checked", true);
        let productId = $('#hdnProductId').val() == "" || null ? 0 : $('#hdnProductId').val();
        if ($("input[name=sizeRadioGroup]").is(":checked") && $("input[name=colorRadioGroup]").is(":checked") && $("input[name=styleRadioGroup]").is(":checked")) {
            $.ajax({
                type: 'GET',
                //url: '/Product/GetItemsBySizeColorAndStyle',
                url: '/Product/CallProShopConfigurator',
                data: { productId: productId, size: $("input[name=sizeRadioGroup]:checked").val(), color: $("input[name=colorRadioGroup]:checked").val(), style: $("input[name=styleRadioGroup]:checked").val() },
                crossDomain: true,
                success: function (data) {
                    if (data != null) {
                        checkForItem(data, false);
                    }

                },
                error: function (data) {


                }
            });
        }
    }

    function setRelatedProductItemPrice(productId) {

        if ($("#ddlRelProdItem_" + productId).find(':selected').val() == -1)
            $("#relProItemPrice_" + productId).html('');
        else {
            var price = Number($("#ddlRelProdItem_" + productId).find(':selected').attr('sku-price'));
            if (price == 0)
                $("#relProItemPrice_" + productId).html('');
            else
                $("#relProItemPrice_" + productId).html("$" + price.toFixed(2));
        }
    }

    function loadSkusBasedOnFeatureProductSelection(obj) {
        let productId = $(obj).attr('product-id');
        if ($("#customCheck_" + productId).is(':checked')) {
            $("#ddlRelProdItem_" + productId).removeAttr('disabled');
        }
        else {
            $("#ddlRelProdItem_" + productId).attr("disabled", true);
        }

    }

    return {
        getColorBySize: getColorBySize,
        getItemsBySizeAndColor: getItemsBySizeAndColor,
        getItemsBySizeColorAndStyle: getItemsBySizeColorAndStyle,
        setRelatedProductItemPrice: setRelatedProductItemPrice,
        loadSkusBasedOnFeatureProductSelection: loadSkusBasedOnFeatureProductSelection
    };
}();