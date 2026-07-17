$(document).ready(function () {
    $(".shippingOptionAdrz")
        .click(function () {
            orderEntry.optionShippingAddress();
        });

    // orderEntry.setCartItemCount();
    jQuery.extend(jQuery.validator.messages, {
        required: null
    });
    generalHandlers.setInputMask(".masked-phone", "phone");

    $("#frmPaymentSubmit").submit(function (e) {
        orderEntry.processFunc();
    });
});

var orderEntry = function () {

    function addToBucket() {
        let items = [];
        let modifiersArray = [];
        let skuId = 0;
        let qty = 0;
        let maxQty = 0;
        let itemFits = "";
        debugger;
        if ($("#hdnProductTypeId").val() == 3) {
            $('#tbProductItem .qty-collector').each(function () {

                if ($("#chk_" + $(this).attr("skuId")).is(":checked") && parseInt($(this).val()) > 0) {

                    skuId = $(this).attr("skuId");
                    qty = $("#qty_" + skuId).val();
                    maxQty = $(this).attr("maxQty");
                    
                    if (qty > 0) items.push(new OrderItemFactory(skuId, qty, maxQty));
                }

            });

            //if (items.length == 0) {
            //    generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Please select at least one item and quantity</p>", null, null, 2500);
            //    return false;
            //}
        }
        else if ($("#hdnProductTypeId").val() == 9)
        {
            $("#divProShopItemDetails .qty-collector").each(function (i, e) {
                skuId = $(e).attr("skuId");
                qty = $("#qty_" + skuId).val();
                maxQty = $(e).attr("maxQty");
                size = $("input[name=sizeRadioGroup]:checked").length > 0 ? $("input[name=sizeRadioGroup]:checked").val() : "";
                color = $("input[name=colorRadioGroup]:checked").length > 0 ? $("input[name=colorRadioGroup]:checked").val() : "";
                style = $("input[name=styleRadioGroup]:checked").length > 0 ? $("input[name=styleRadioGroup]:checked").val() : "";
                /*skuImage = $('.preview-pic .zoom-img').attr('src');*/
                skuImage = $('.preview-pic .zoomWrapper .zoom-img').attr('src');
                if (qty > 0) items.push(new OrderItemFactory(skuId, qty, maxQty, null, null, size, color, style, skuImage));
            });
        }
        else {
            $("#tbProductItem .qty-collector").each(function (i, e) {
                skuId = $(e).attr("skuId");
                qty = $("#qty_" + skuId).val();
                maxQty = $(e).attr("maxQty");
                itemFits = $("#ddlYear").val() + " " + $("#ddlMake").val() + " " + $("#ddlModel").val();
                if (qty > 0) items.push(new OrderItemFactory(skuId, qty, maxQty, null, null, null, null, null, null, null, null, null, itemFits));
            });

            //$("input[type='checkbox'][name='chkselectedModifier']").each(function () {
            //    modifiersArray.push(new ModifierFactory($(this).attr('instanceid'), $(this).attr('modifierid'), $(this).attr('optionid'), '', $(this).attr('modifiername'), $(this).attr('optionname'), $(this).attr('modifierPrice')));
            //});

            $("#syncOptionModList input[type='radio']:checked").each(function () {
                modifiersArray.push(new ModifierFactory($(this).attr('instanceid'), $(this).attr('modifierid'), $(this).attr('optionid'), '', $(this).attr('modifiername'), $(this).attr('optionname'), $(this).attr('modifierPrice')));
            });

            if ($("#hdnModifiersCount").val() != modifiersArray.length) {
                generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Please select options to continue</p>", null, null, 2500);
                return false;
            }

            //if (items.length === 0) {
            //    generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Please select a quantity to add to cart</p>", null, null, 2500); //type----- 0 == error 1 == sucess
            //    return false;
            //}
        }

        if (items.length == 0) {
            generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Please select at least one item and quantity</p>", null, null, 2500);
            return false;
        }

        $.post("/Order/AddItemsToBucket", { items: items, selectedCurrentModifiers: modifiersArray }, function (data) {
            if ($("#syncOptionModList input[type='radio']:checked").length > 0) $('#syncOptionModList').find('input[type=radio]:checked').prop('checked', false);
            processFunc();
            //location.href = "/Order/Cart";
            redirectToCart();
        }).fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            alert("Request Failed: " + err);
            generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Request Failed:" + err + "</p>", null, null, 2500);
        });
    }

    function redirectToCart() {
        $.get("/Order/ViewCart", {}, function (data) {
            $('.sliding-cart #divSlidingCart').html(data);
            openSlideCart();
            $(".web-loader").hide();
            $(".web-loader-second").hide();
        }).fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            alert("Request Failed: " + err);
            generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Request Failed:" + err + "</p>", null, null, 2500);
        });
    }

    function ModifierFactory(instanceId, modifierId, optionId, text, modifiername, optionname, modifierPrice) {
        this.instanceId = instanceId;
        this.modifierId = modifierId;
        this.optionId = optionId;
        this.text = text;
        this.modifiername = modifiername;
        this.optionname = optionname;
        this.price = modifierPrice;
    }

    function removeItem(itemId) {

        $("#itemRaw_" + itemId).remove();
        $.post("/Order/RemoveItemFromBucket", { itemId: itemId }, function (count) {
            if (count < 1) {
                $("#cartContainer").hide();
                $("#noCartItemContainer").show();
            }
            orderEntry.setCartItemCount();
            currentOrderInfo();
            redirectToCart();
        }).fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            alert("Request Failed: " + err);
        });
    }

    function currentOrderInfo() {
        var fromCart = false;
        if (window.location.href.toLowerCase().indexOf("cart") > -1) {
            fromCart = true;
        }

        $.get("/Order/CurrentOrderInfo", { fromCart: fromCart }, function (data) {
            $("#curentOrderInfo").html(data);
        }).fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            alert("Request Failed: " + err);
        });

    }

    function setCartItemCount() {
        $.get("/Order/GetCartItemCount", {}, function (data) {
            if (data === 0) {
                $(".wrapper-cart-count , #btn_checkout").hide();
            }
            else {
                $(".wrapper-cart-count").html(data);
                $(".wrapper-cart-count , #btn_checkout").show();
            }

        }).fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            alert("Request Failed: " + err);
        });
    }


    //function changeItemQty(itemId, price, isFromCart) {
    //    var qty = 0;
    //    if (isFromCart) {
    //        qty = $("#divSlidingCart #qty_" + itemId).val();
    //        if (qty < 1) {
    //            qty = 1;
    //            $("#divSlidingCart #qty_" + itemId).val(1);
    //        }
    //    }
    //    else {
    //        qty = $("#qty_" + itemId).val();
    //        if (qty < 1) {
    //            qty = 1;
    //            $("#qty_" + itemId).val(1);
    //        }
    //    }

    //    //let total = (qty * price).toFixed(2);
    //    // $("#itemTotal_" + itemId).text("$" + total);

    //    let orderItem = new OrderItemFactory(itemId, qty);
    //    $.post("/Order/ChangeItemQty", { orderItem: orderItem }, function (data) {
    //        //currentOrderInfo();
    //        redirectToCart();
    //    }).fail(function (jqxhr, textStatus, error) {
    //        var err = textStatus + ", " + error;
    //        alert("Request Failed: " + err);
    //    });

    //}

    function changeItemQty(itemId, price, isFromSlidingCart) {
        debugger;
        var qty = 0;
        if (isFromSlidingCart) {
            qty = $("#divSlidingCart #qty_" + itemId).val();
            if (qty < 1) {
                qty = 1;
                $("#divSlidingCart #qty_" + itemId).val(1);
            }
        }
        else {
            qty = $("#qty_" + itemId).val();
            if (qty < 1) {
                qty = 1;
                $("#qty_" + itemId).val(1);
            }

            let total = (qty * price).toFixed(2);
            $("#itemTotal_" + itemId).text("$" + total);
        }

        //let total = (qty * price).toFixed(2);
        // $("#itemTotal_" + itemId).text("$" + total);

        let orderItem = new OrderItemFactory(itemId, qty);
        $.post("/Order/ChangeItemQty", { orderItem: orderItem }, function (data) {
            //$(".web-loader-second").show();
            //currentOrderInfo();
            debugger;
            if (isFromSlidingCart) redirectToCart();
            else currentOrderInfo();
        }).fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            alert("Request Failed: " + err);
        });

    }

    function setShippingInfo() {
        if ((formValidator("frmCustomerMainInfo") && formValidator("frmOrderAddress"))) {
            let userInfo = collectAddressInfo();
            $.post("/Order/SetShippingInfo", { userInfo: userInfo, contactNotify: $("#chkOffersDiscount").is(":checked") }, function (data) {
                if (data) {
                    processFunc();
                    location.href = "/Order/OrderConfirmation";
                }
            }).fail(function (jqxhr, textStatus, error) {
                var err = textStatus + ", " + error;
                alert("Request Failed: " + err);
            });

        }
    }

    function collectAddressInfo() {
        let address = new OrderAddressFactory($("#txtFirstName").val(), $("#txtLastName").val(), $("#txtAddress1").val(), $("#txtAddress2").val(), $("#txtCity").val()
            , $("#ddlCountry").val(), $("#ddlState").val(), $("#txtPostalCode").val(), $("#ddlCountry").find('option:selected').text(), $("#ddlState").find('option:selected').text(),
            $("#txtEmail").val(), $("#txtMobile").val());
        return address;

    }

    function optionShippingAddress() {
        if ($('input[name="rdShippingAddreesOpt"]:checked').val() === "0") {
            $("#orderShippingAddrees").slideUp();
        }
        else $("#orderShippingAddrees").slideDown();

    }

    function OrderItemFactory(id, qty, maxQty, price, productId, size, color, style, img, skuProductName, condition, material, itemFitsDetail) {
        this.ItemId = id;
        this.LineQty = qty;
        this.MaxQuantity = maxQty;
        this.LineUnitPrice = price;
        this.ProductId = productId;
        this.ItemSize = size;
        this.ItemColor = color;
        this.ItemStyle = style;
        this.ItemImage = img;
        this.ProductName = skuProductName;
        this.ItemFitsDetail = itemFitsDetail;
    }

    function OrderAddressFactory(fName, lName, address1, address2, city, country, state, postal, countryName, stateName, email, phone) {
        this.FirstName = fName;
        this.LastName = lName;
        this.Address1 = address1;
        this.Address2 = address2;

        this.City = city;
        this.CountryId = country;
        this.StateAbbr = state;
        this.StateName = stateName;

        this.PostalCode = postal;
        this.CountryName = countryName;
        this.CountryCode = $("#ddlCountry").find('option:selected').attr("code");
        this.Email = email;
        this.Phone = phone;
    }

    function visiblePassword(e) {
        if ($(e).is(":checked")) {
            $("#passwordContainer").show();
        }
        else $("#passwordContainer").hide();
    }

    function submitOrder() {

        if (formValidator("frmShippingRule") && formValidator("frmOrderAddress") && ($("#frmPassword").length == 0 || formValidator("frmPassword")) && formValidator("formCreditcard")) {

            let password = "";
            let addLogin = false;

            if ($("#chkExpressCheckout").is(":checked")) {
                addLogin = true;
                if (!validatePassword()) {
                    generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>" + errors + "</p>", null, null, 2500);
                    return false;
                }
            }

            password = $("#txtPsswrd").val();
            let sameAsShipping = $('input[name="rdShippingAddreesOpt"]:checked').val() === "0";
            let userInfo = collectAddressInfo();

            $.post("/Order/SubmitOrder", {

                sameAsShipping: sameAsShipping, userInfo: userInfo, shippingMthod: $("#ddlShippingMethod").val(),
                shippingMthodName: $("#ddlShippingMethod").find('option:selected').attr("name"),
                password: password, createLogin: addLogin, ccType: Number($("#txt_cc_number").attr('card-type'))
            }, function (data) {
                    if (data.isSuccess) {
                        setForm(data.uri);
                    }

                $("#frmPaymentSubmit").submit();

            }).fail(function (jqxhr, textStatus, error) {
                var err = textStatus + ", " + error;
                alert("Request Failed: " + err);
            });
        }
    }

    function processFunc() {
        if ($(".web-loader").is(":visible")) {
            $(".web-loader").hide();
            $(".web-loader-second").show();
        }
    }

    function setShippingMethod() {
        $.post("/Order/SetShippingMethod", {
            shippingMethod: $("#ddlShippingMethod").val(),
            shippingMethodName: $("#ddlShippingMethod").find('option:selected').attr("name"),
            cost: $("#ddlShippingMethod").find('option:selected').attr("cost")
        }, function (data) {
            currentOrderInfo();
        }).fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            alert("Request Failed: " + err);
        });

    }

    function setForm(uri) {
        $("#frmPaymentSubmit").attr('action', uri);
        $("#cc_number").val($("#txt_cc_number").val());
        $("#cc_exp").val($("#cardPaymentExpireMonth").val() + $("#cardPaymentExpireYear").val().substring(2));
        $("#cvv").val($("#txt_cc_SecurityCode").val());
    }


    function getOrders() {

        if ($("#hdnTarget").val() === 'Orders') {
            $("#headingFour").trigger("click");
        }

        $.get("/Order/PastOrders", {}, function (data) {
            $("#orderHistoryContainer").html(data);

        }).fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            alert("Request Failed: " + err);
            generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Request Failed:" + err + "</p>", null, null, 2500);
        });
    }

    //function qtyHandler(skuId, enumerate, target) {
    //    let element = $("#qty_" + skuId);
    //    let qty = Number($(element).val()) + enumerate;
    //    if (qty < 1) {
    //        qty = 0;

    //        if (target === 'cart') {
    //            qty = 1;
    //        }
    //    }
    //    $(element).val(qty);
    //}

    //function validatePassword() {
    //    errors = "";
    //    debugger

    //    let password = document.getElementById('txtPsswrd').value;

    //    if (password.length < 8) {
    //        errors = "Your password must be at least 8 characters";
    //        return false;
    //    }
    //    if (password.search(/[a-z]/i) < 0) {
    //        errors = "Your password must contain at least one letter.";
    //        return false;
    //    }
    //    if (password.search(/[0-9]/) < 0) {
    //        errors = "Your password must contain at least one digit.";
    //        return false;
    //    }

    //    if (password != $("#txtPsswrdCnfrm").val()) {
    //        errors = "Password is not matched.";
    //        return false;
    //    }

    //    return true;
    //}

    function clearOrderSession() {
        $.post("/Order/ClearOrderSession", {}, function (data) {

        }).fail(function () {

        });
    }


    return {
        addToBucket: addToBucket,
        removeItem: removeItem,
        changeItemQty: changeItemQty,
        setShippingInfo: setShippingInfo,
        optionShippingAddress: optionShippingAddress,
        setCartItemCount: setCartItemCount,
        visiblePassword: visiblePassword,
        submitOrder: submitOrder,
        setShippingMethod: setShippingMethod,
        getOrders: getOrders,
        //qtyHandler: qtyHandler,
        currentOrderInfo: currentOrderInfo,
        processFunc: processFunc,
        clearOrderSession: clearOrderSession
    };

}()


var cartEntry = function () {

    function tryContactVerify(e) {
        $.get('/Order/TryContactVerify', { email: $(e).val() }, function (data) {
            if (data.item1) {
                if (data.item3) {
                    $("#contactType").text("phone");
                } else {
                    $("#contactType").text("email");
                }
                $("#verifyModal").modal('show');
                $('#verifyModal').on('shown.bs.modal', function () {
                    $("#verifyInputs input[type='text']").trigger('focus');
                })

            }
        }).fail(function () {

        });
    }

    function verificationConfirm() {
        var inputNumber = "";
        inputNumber = $("#verifyInputs :input").val();
        if (inputNumber.length === 6) {
            verifyCode(inputNumber);
        }
    }

    function verifyCode(code) {
        $.post('/Order/VerifyCode', { input: code, email: $("#txtEmail").val() }, function (data) {
            if (data.isCorrectInput) {
                setCustomerData(data.userInfo)
                $("#verifyModal").modal('hide');

                if (data.successLogin) {
                    $("#txtEmail").prop("disabled", true);
                    $("#loginStatusNotifier").hide();
                }
            } else {
                $("#verifyInputs input").css('background-color', '#d05454a8');
                $("#validationError").show();
            }
        }).fail(function () {
        });
    }

    function redirectToLogin() {
        window.location.href = "/Account/Login?retUrl=" + window.location.href + "&from=cusInfo";
    }

    function setCustomerData(data) {
        $("#txtFirstName").val(data.contactFirstName);
        $("#txtLastName").val(data.contactLastName);
        $("#txtAddress1").val(data.contactAddress);
        $("#txtAddress2").val(data.contactAddress2);
        $("#txtCity").val(data.contactCity);
        $('#ddlCountry option[code=' + '' + data.contactCountry + '' + ']').prop('selected', true);
        generalHandlers.getStatesByCountry(data.contactCountry, data.contactStateOrTerritory);
        $("#txtPostalCode").val(data.contactPostal);
        $("#txtMobile").val(data.contactPhone);
        $("#chkOffersDiscount").prop('checked', data.contactOptIn);
    }

    function couponSubmit(e) {

        var code = $(e).val();

        if (code == null || code.trim() == "") {
            showCouponErrorLabel("Code is required to Redeem");
        } else {
            $.post("/Order/CouponSubmit", { couponCode: code }, function (data) {
                if (data.isSuccessful) {
                    orderEntry.currentOrderInfo();
                    hideCouponErrorLabel();
                    generalHandlers.loadSimpleMessage(1, "<p class='mb-0'>Your coupon code was entered successfully</p>", null, null, 2500); //type----- 0 == error 1 == sucess
                } else {
                    showCouponErrorLabel(data.responseMessage);
                }
            }).fail(function () {

            });
        }
    }

    function showCouponErrorLabel(errorText) {
        $("#lblCouponError").show();
        $("#lblCouponError").text(errorText);
    }

    function hideCouponErrorLabel() {
        $("#lblCouponError").hide();
        $("#lblCouponError").text("");
    }

    function cartCheckout() {
        $(".web-loader-second").show();
        location.href = '/Order/CustomerInfo';

    }

    return {
        tryContactVerify: tryContactVerify,
        verificationConfirm: verificationConfirm,
        redirectToLogin: redirectToLogin,
        couponSubmit: couponSubmit,
        cartCheckout: cartCheckout
    };

}()



