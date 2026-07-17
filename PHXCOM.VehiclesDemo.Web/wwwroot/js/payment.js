function getCardType() {
    debugger;
    // visa
    var number = $("#txt_cc_number").val();

    if (number.length != 16) {
        $("#cardType").removeClass('credit-card-visa required');           
        $("#cardType").removeClass('credit-card-master required');
        $("#cardType").removeClass('credit-card-amex required');
        $("#cardType").removeClass('credit-card-discover required');
        $("#cardType").addClass("credit-card-default required");    
    }
    else
    {
        var re = new RegExp("^4");
        if (number.match(re) != null && number.length == 16)
            return showCardImage("visa", 1)

        // Mastercard
        re = new RegExp("^5[1-5]");
        if (number.match(re) != null)
            return showCardImage("mastercard", 2);

        // AMEX
        re = new RegExp("^3[47]");
        if (number.match(re) != null)
            return showCardImage("amex", 3);

        // Discover
        re = new RegExp("^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)");
        if (number.match(re) != null && number.length == 16)
            return showCardImage("discover", 4);

        // Diners
        re = new RegExp("^36");
        if (number.match(re) != null)
            return showCardImage("diners", 0);

        // Diners - Carte Blanche
        re = new RegExp("^30[0-5]");
        if (number.match(re) != null)
            return showCardImage("diners-carte-blanche", 0);

        // JCB
        re = new RegExp("^35(2[89]|[3-8][0-9])");
        if (number.match(re) != null)
            return showCardImage("jcb", 0);

        // Visa Electron
        //re = new RegExp("^(4026|417500|4508|4844|491(3|7))");
        //if (number.match(re) != null)
        //    return "Visa Electron";

        //return "";
    }
    
}

function isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;
    return true;
}

function showCardImage(type, ccTypeId)
{
    $("#txt_cc_number").attr('card-type', ccTypeId);
    $("#cardType").text("");

    //if (type == "visa") $("#cardType").text("Visa");
    //else if (type == "mastercard") $("#cardType").text("Mastercard");
    //else if (type == "amex") $("#cardType").text("AMEX");
    //else if (type == "discover") $("#cardType").text("Discover");
    //else if (type == "diners") $("#cardType").text("Diners");
    //else if (type == "diners-carte-blanche") $("#cardType").text("Diners - Carte Blanche");
    //else if (type == "jcb") $("#cardType").text("JCB");

    if (type == "visa") $("#cardType").addClass('credit-card-visa required');
    else if (type == "mastercard") $("#cardType").addClass('credit-card-master required');
    else if (type == "amex") $("#cardType").addClass('credit-card-amex required');
    else if (type == "discover") $("#cardType").addClass('credit-card-discover required');
    else $('#cardType').addClass('credit-card-default required');      
}

