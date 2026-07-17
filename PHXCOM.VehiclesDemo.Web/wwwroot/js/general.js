var generalHandlers = function () {
    function loadSimpleMessage(type, message, isDisplay, customwrapper, disappear) {
        // method handle show hide simple custom messages 
        // able to parse html through the message or can parse custom wrapper // type ----- 0==error 1== sucess
        let masterwrapper = "#successErrorMsg";
        if (customwrapper !== "undefined" && customwrapper !== null) masterwrapper = "#" + customwrapper;

        if (type === 0) type = "error";
        else type = "success";

        let html = "<div class='msg-" + type + " py-3'>"
            + "<div>" + message + "</div>"
            + "</div>";

        $(masterwrapper).html(html);

        if (isDisplay) $(masterwrapper).fadeIn();
        else if (!isDisplay && isDisplay !== null) $(masterwrapper).fadeOut();
        else {
            $(masterwrapper).fadeIn(100);
            setTimeout(function () {
                $(masterwrapper).fadeOut(100);
                $(".simple-message-overlay").remove();
            }, disappear);
        }
        $("body").append('<div class="simple-message-overlay"></div>');
    }

    function setInputMask(element, type) {
        // add later more types
        let mask = "";
        switch (type) {
            case "phone":
                mask = "(999) 999-9999";
                break;
        }
        $(element).each(function () {
            $(this).mask(mask);
        });
    }


    function search(e) {
        //let appCookie = "";
        let applicationId = 0
        //if (document.cookie.indexOf('cookieObject') != -1)
        //{
        //    var cookieValue = document.cookie.split('; ').find(row => row.startsWith('cookieObject')).split('=')[1];
        //    appCookie = JSON.parse(cookieValue);
        //    applicationId = appCookie.appId;
        //}
        if (sessionStorage.getItem('currentAppFilter') != null && sessionStorage.getItem('currentAppFilter').length > 0)
        {
            var currentFilter = JSON.parse(sessionStorage.getItem('currentAppFilter'));
            applicationId = currentFilter.appId;
        }
            
        if ($(e).val().length > 2) {
            $("#searchResultContainer").empty();
            $.get("/Home/Search", { searchText: $(e).val(), applicationId: applicationId }, function (data) {
                $("#searchResultContainer").html(data).show();
                $("#searchResultContainer").niceScroll();
                $(document).mouseup(function (e) {
                    var container = $("#searchResultContainer");
                    // If the target of the click isn't the container
                    if (!container.is(e.target) && container.has(e.target).length === 0) {
                        container.hide();
                    }
                });
            }).fail(function (jqxhr, textStatus, error) {
                var err = textStatus + ", " + error;
                alert("Request Failed: " + err);
            });
        } else {
            $("#searchResultContainer").empty().hide();
        }
    }

    function getStatesByCountry(countryCode, currentState, currentId) {
        
        if (countryCode === undefined)
        {
            if ($("#hdnMyVehicleSave").val() == "true") countryCode = $("#ddlCountry_" + currentId).find('option:selected').attr("code");
            else 
                countryCode = $("#ddlCountry").find('option:selected').attr("code");
        }         

        if (countryCode != "") {
            $.get("/Order/GetStates", { countryCode: countryCode }, function (data) {

                var res = data.map(function (item) {
                    return "<option value='" + item.stateAbbr + "'>" + item.stateName + "</option>";
                });
                
                if ($("#hdnMyVehicleSave").val() == "true") $("#ddlState_" + currentId).html("<option value='' >--Select-- </option>" + res.join(" "));
                else
                    $("#ddlState").html("<option value='' >--Select-- </option>" + res.join(" "));

                if (currentState !== undefined) {
                    if ($("#hdnMyVehicleSave").val() == "true") $("#ddlState_" + currentId).val(currentState);
                    else
                        $("#ddlState").val(currentState);
                }

            }).fail(function (jqxhr, textStatus, error) {
                var err = textStatus + ", " + error;
                alert("Request Failed: " + err);
            });
        }
    }

    function flushMemoryCache() {
        $.post("/Home/FlushCache", {}, function (data) {
            window.location.href = "/";

        }).fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            alert("Request Failed: " + err);
        });
    }

    return {
        loadSimpleMessage: loadSimpleMessage,
        setInputMask: setInputMask,
        search: search,
        getStatesByCountry: getStatesByCountry,
        flushMemoryCache: flushMemoryCache
    };

}();


$(document).ready(function () {


    $(document).bind("ajaxSend", function () {
        $(".web-loader").show();
    }).bind("ajaxComplete", function () {
        $(".web-loader").hide();
    });

    var typingTimer;                //timer identifier
    var doneTypingInterval = 1000;  //time in ms, 5 second for example
    var $input = $('#txtSearch');

    //on keyup, start the countdown
    $input.on('keyup', function () {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(generalHandlers.search($input), doneTypingInterval);
    });

    //on keydown, clear the countdown 
    $input.on('keydown', function () {
        clearTimeout(typingTimer);
    });

    var pagetitle = window.location.href.split("/");
    pagetitle = pagetitle[pagetitle.length - 1];
    pagetitle = pagetitle.toLowerCase().split('.')[0];
    let title = "";

    $(".navigation-top li").each(function () {
        title = $(this).find("a").attr("refer");
        if (title !== undefined) title = title.toLowerCase();
        if (title == pagetitle) {
            $(this).addClass(" selected-menu-item");
        }
    });
    $(".navbar-nav.right-secondry li").each(function () {
        if ($(this).find("a").attr("refer").toLowerCase() == pagetitle) {
            $(this).addClass(" selected-menu-item");
        }
    });
    //managePagescroll();
    $(window).scroll(function () {
        //if ($("header").html().trim() != "") managePagescroll();
        if ($("header").html().trim() != "");
    });

    var winHeight = $(window).height();
    var wrapHeight = $('.set-min-height').height();
    var footerHeight = $('.footer').height();
    var HeaderHeight = $('.header-height').height();

    if (winHeight > wrapHeight) {
        $('.set-min-height').css('min-height', winHeight - (footerHeight + HeaderHeight) + 'px');
    } 

    $(".navbar-nav .nav-item").each(function (index) {
        if ($(this).hasClass($('#hdnCurrentNavName').val())) {
            $(this).addClass("active");
        }
    });

});

window.onscroll = function () { stickMenu() };

// Get the navbar
var navbar = document.getElementById("siteHeader");


// Add the sticky class to the navbar when you reach its scroll position. Remove "sticky" when you leave the scroll position
function stickMenu() {
    if (screen.width > 991) {
        if (window.pageYOffset >= 200) {
            navbar.classList.add("fixed")
            $("body").addClass('nav-fixed');
            $("body").attr("id", "navFixed");
        } else {
            navbar.classList.remove("fixed");
            $("body").removeClass('nav-fixed');
            $("body").removeAttr("id");
        }
    }
}

$(document).keypress(function (e) {
    var keycode = (e.keyCode ? e.keyCode : e.which);
    if (keycode == '13') {
        let element = $(".enterHandler");
        if ($(element).length == 1) {
            $(element).trigger("click");
            //let func = $(element).attr("onclick");
            //eval(func);
        }
    }
});

var errors = "";

function managePagescroll() {
    var sticky = $('header'),
        scroll = $(window).scrollTop();
    if (scroll >= 250) sticky.addClass('menu-fixed');
    else if (sticky.hasClass("menu-fixed")) sticky.removeClass('menu-fixed');


}

function openSlideCart() {
    //$(".web-loader").show();
    if ($('#divSlidingCart .contents').length == 0) {
        $.get("/Order/ViewCart", {}, function (data) {
            $('.sliding-cart #divSlidingCart').html(data);
            $(".web-loader").hide();
            $(".web-loader-second").hide();
        }).fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            alert("Request Failed: " + err);
            generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Request Failed:" + err + "</p>", null, null, 2500);
        });
    }
    $('.sliding-cart').addClass('slide-in');
}
function closeSlideCart() {
    $('.sliding-cart').removeClass('slide-in');
}

$(document).mouseup(function (e) {
    var container = $(".sliding-cart");

    // if the target of the click isn't the container nor a descendant of the container
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        closeSlideCart()
    }
});

function formValidator(formId) {

    return $("#" + formId).valid();
}

function validateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
        return true;
    }
    return false;
}

function validatePassword() {
    errors = "";
    let password = document.getElementById('txtPsswrd').value;

    if (password.length < 8) {
        errors = "Your password must be at least 8 characters";
        return false;
    }
    if (password.search(/[a-z]/i) < 0) {
        errors = "Your password must contain at least one letter.";
        return false;
    }
    if (password.search(/[0-9]/) < 0) {
        errors = "Your password must contain at least one digit.";
        return false;
    }

    if (password != $("#txtPsswrdCnfrm").val()) {
        errors = "Password is not matched.";
        return false;
    }

    return true;
}

function isNumberKey(evt) {
    
    var charCode = (evt.which) ? evt.which : evt.keyCode
    return !(charCode > 31 && (charCode < 48 || charCode > 57));
}

