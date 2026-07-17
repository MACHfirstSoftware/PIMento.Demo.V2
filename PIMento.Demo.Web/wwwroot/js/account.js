var account = function () {

    function AccountInfoFactory(id, fName, lName, address1, address2, city, country, state, postal, phone, company) {

        this.ContactId = id;
        this.ContactFirstName = fName;
        this.ContactLastName = lName;
        this.ContactAddress = address1;
        this.ContactAddress2 = address2;

        this.ContactCity = city;
        this.ContactCountry = country;
        this.ContactStateOrTerritory = state;
        this.ContactCompany = company;

        this.ContactPostal = postal;
        this.ContactPhone = phone;
        //this.ContactFax = fax;

    }


    function editAccountInfo() {
        if (formValidator('frmAccountInfo')) {
            let account = collectAccountInfo();

            $.post("/Account/EditAccountInfo", { contact: account }, function (data) {
                if (data) {
                    generalHandlers.loadSimpleMessage(1, "<p class='mb-0'>Account Details Have Been Updated Successfully</p>", null, null, 2500);
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

    //function updateEmailAndPassword()
    //{
    //    if (formValidator('frmChangeEmail') && formValidator('frmPasswordChange'))
    //    {
    //        let email = $("#txtEmail").val();
    //        let password = $("#txtPsswrd").val();
    //        if (validateEmail(email))
    //        {
    //            if (!validatePassword()) {
    //                generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>" + errors + "</p>", null, null, 2500);
    //                return false;
    //            }
    //            else
    //            {
    //                $.post("/Account/UpdateEmailAndPassword", { email: email, password: password }, function (data) {

    //                    if (data.isEmailSuccessfull == 1 && data.isPasswordSuccessfull) {
    //                        generalHandlers.loadSimpleMessage(1, "<p class='mb-0'>Email & Password Have Been Updated Successfully</p>", null, null, 2500);
    //                    }
    //                    else if (data.isEmailSuccessfull == 2) {
    //                        generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Email already taken</p>", null, null, 2500);
    //                    }
    //                    else if (data.isEmailSuccessfull == 3) {
    //                        generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Something went wrong</p>", null, null, 2500);
    //                    }
    //                    else if (!data.isPasswordSuccessfull)
    //                    {
    //                        generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Something went wrong</p>", null, null, 2500);
    //                    }
    //                    $("#txtPsswrd").val("");
    //                    $("#txtPsswrdCnfrm").val("");

    //                }).fail(function (jqxhr, textStatus, error) {
    //                    var err = textStatus + ", " + error;
    //                    alert("Request Failed: " + err);
    //                });
    //            }
    //        }
    //        else
    //        {
    //            generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Invalid Email Address</p>", null, null, 2500);
    //        }
    //    }
    //}

    function updateEmailAndPassword() {
        let password = "";
        let notify = false;
        
        if (formValidator('frmChangeEmail')) {
            let email = $("#txtEmail").val();

            if (validateEmail(email)) {
                notify = $("#notify").is(":checked");
                password = $("#txtPsswrd").val();

                if (password != "") {
                    if (formValidator('frmPasswordChange')) {

                        if (!validatePassword()) {
                            generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>" + errors + "</p>", null, null, 2500);
                            return false;
                        }
                    }
                }


                $.post("/Account/UpdateEmailAndPassword", { email: email, notify: notify, password: password }, function (data) {
                    
                    if (data.isEmailSuccessfull == 1) {
                        if (data.isPasswordSuccessfull) {
                            generalHandlers.loadSimpleMessage(1, "<p class='mb-0'>Email & Password Have Been Updated Successfully</p>", null, null, 2500);
                        }
                        else {
                            generalHandlers.loadSimpleMessage(1, "<p class='mb-0'>Email Has Been Updated Successfully</p>", null, null, 2500);
                        }

                    }
                    else if (data.isEmailSuccessfull == 2) {
                        generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Email already taken</p>", null, null, 2500);
                    }
                    else if (data.isEmailSuccessfull == 3) {
                        generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Something went wrong</p>", null, null, 2500);
                    }
                    else if (!data.isPasswordSuccessfull) {
                        generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Something went wrong</p>", null, null, 2500);
                    }
                    $("#txtPsswrd").val("");
                    $("#txtPsswrdCnfrm").val("");

                }).fail(function (jqxhr, textStatus, error) {
                    var err = textStatus + ", " + error;
                    alert("Request Failed: " + err);
                });
            }
            else {
                generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Invalid Email Address</p>", null, null, 2500);
            }
        }
    }

    //function updateEmail() {

    //    if (formValidator('frmChangeEmail')) {
    //        let email = $("#txtEmail").val();
    //        if (validateEmail(email)) {
    //            //if (email != $("#txtEmailConfirm").val()) {
    //            //    generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Email Is Not Matched</p>", null, null, 1500);
    //            //    return false;
    //            //}
    //            $.post("/Account/UpdateEmail", { email: email }, function (data) {
    //                if (data === 1) {
    //                    generalHandlers.loadSimpleMessage(1, "<p class='mb-0'>Email Has Been Updated Successfully</p>", null, null, 2500);
    //                }
    //                else if (data === 2) { generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Email already taken</p>", null, null, 2500); }
    //                else generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Something went wrong</p>", null, null, 2500);

    //            }).fail(function (jqxhr, textStatus, error) {
    //                var err = textStatus + ", " + error;
    //                alert("Request Failed: " + err);
    //            });
    //        }
    //        else {
    //            generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Invalid Email Address</p>", null, null, 2500);
    //        }
    //    }


    //}

    //function changePassword() {
    //    if (formValidator('frmPasswordChange')) {
    //        let password = $("#txtPsswrd").val();
    //        if (!validatePassword()) {
    //            generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>" + errors + "</p>", null, null, 2500);
    //            return false;
    //        }
    //        $.post("/Account/ChangePassword", { password: password }, function (data) {
    //            if (data) {
    //                generalHandlers.loadSimpleMessage(1, "<p class='mb-0'>Password Has Been Updated Successfully</p>", null, null, 2500);
    //            }
    //            else {
    //                generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Something went wrong</p>", null, null, 2500);
    //            }
    //        }).fail(function (jqxhr, textStatus, error) {
    //            var err = textStatus + ", " + error;
    //            alert("Request Failed: " + err);
    //        });
    //    }
    //}

    function resetPassword() {
        if (formValidator('frmResetPassword')) {
            let password = $("#txtPsswrd").val();
            if (!validatePassword()) {
                generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>" + errors + "</p>", null, null, 2500);
                return false;
            }
            let token = location.href.split('/').pop();
            $.post("/Account/ResetPassword", { token: token, password: password }, function (data) {
                if (data) {
                    generalHandlers.loadSimpleMessage(1, "<p class='mb-0'>Password Has Been Updated Successfully</p>", null, null, 2500);

                    setTimeout(function () {
                        location.href = "/Account/Login";
                    }, 1500)
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


    function collectAccountInfo() {
        return new AccountInfoFactory($("#hdnContactId").val(), $("#txtFirstName").val(), $("#txtLastName").val(), $("#txtAddress1").val(), $("#txtAddress2").val(), $("#txtCity").val()
            , $("#ddlCountry").find('option:selected').attr("code"), $("#ddlState").val(), $("#txtPostalCode").val(), $("#txtMobile").val(), $("#txtCompany").val());
    }


    function login() {
        if (formValidator('frmUserLogin')) {

            $.post("/Account/DoLogin", { userName: $("#txtUserName").val(), password: $("#txtPassword").val() }, function (data) {
                if (data) {
                    if (window.location.href.indexOf('retUrl') > -1) {
                        var decodedUrl = decodeURI(window.location.href);
                        var retUrl = getParameterByName('retUrl', decodedUrl.replace(' ', ''));
                        window.location.href = retUrl + "/true";
                    } else {
                        location.href = "/Account";
                    }
                }
                else {
                    generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>User not found. Please try again</p>", null, null, 2500);

                }

            }).fail(function (jqxhr, textStatus, error) {
                var err = textStatus + ", " + error;
                alert("Request Failed: " + err);
            });

        }
    }




    function sendResetPasswordLink() {
        if (formValidator('frmResetPasswordLink')) {
            let email = $("#txtEmail").val();
            if (validateEmail(email)) {

                $.post("/Account/SendResetPasswordLink", { email: email }, function (data) {
                    if (data) {
                        generalHandlers.loadSimpleMessage(1, "<p class='mb-0'>Password Reset Link Has Been Sent Successfully</p>", null, null, 2500);
                    }
                    else {
                        generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>User not Found</p>", null, null, 2500);
                    }
                }).fail(function (jqxhr, textStatus, error) {
                    var err = textStatus + ", " + error;
                    alert("Request Failed: " + err);
                });
            }
            else {
                generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Invalid Email Address</p>", null, null, 2500);
            }
        }
    }

    function logout(savecurrentOrder) {
        if (savecurrentOrder === undefined) savecurrentOrder = false;

        $.post("/Account/Logout", { savecurrentOrder: savecurrentOrder }, function (data) {
            if (data) location.href = "/Index";
            else generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Something went wrong</p>", null, null, 2500);

        }).fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            alert("Request Failed: " + err);
        });


    }

    function getParameterByName(name, url) {
        var match = RegExp('[?&]' + name + '=([^&]*)').exec(url);
        return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
    }

    function continueGuest() {
        if (window.location.href.indexOf('retUrl') > -1) {
            var decodedUrl = decodeURI(window.location.href);
            var retUrl = getParameterByName('retUrl', decodedUrl.replace(' ', ''));
            window.location.href = retUrl;
        } else {
            location.href = "/Index";
        }
    }


    function create() {
        if (formValidator('frmCreateLogin')) {
            let email = $("#txtUserName").val();
            if (validateEmail(email)) {

                if (!validatePassword()) {
                    generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>" + errors + "</p>", null, null, 2500);
                    return false;
                }
                var userInfo = {};
                userInfo.Email = $("#txtUserName").val();
                userInfo.Password = $("#txtPsswrd").val();
                userInfo.FirstName = $("#txtFirstName").val();
                userInfo.LastName = $("#txtLastName").val();

                $.post("/Account/Create", { userInfo: userInfo }, function (data) {
                    if (data === 1) location.href = "/Account";
                    else if (data === 2) { generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Email already taken</p>", null, null, 2500); }
                    else generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Something went wrong</p>", null, null, 2500);

                }).fail(function (jqxhr, textStatus, error) {
                    var err = textStatus + ", " + error;
                    alert("Request Failed: " + err);
                });
            }
            else {
                generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Invalid Email Address</p>", null, null, 2500);
            }
        }
    }

    function showContinueGuestButton() {
        if (window.location.href.indexOf('from') > -1) {
            var decodedUrl = decodeURI(window.location.href);
            var from = getParameterByName('from', decodedUrl.replace(' ', ''));
            if (from == 'cusInfo') { /*from custromer info page*/
                $("#divContinueGuest").show();
            }
        }
    }

    function loadAppMakeDropDown() {
        
        $("#ddlMakeCustomization1").html("<option value='-1'>--Make--</option>");
        $("#ddlModelCustomization1").html("<option value='-1'>--Model--</option>");
        $("#ddlYearCustomization1").html("<option value='-1'>--Year--</option>");

        getMyAccountCumstomizationData(null, '', 'auto');

    }


    function loadSaveVehicles() {
        
        let contactId = $("#hdnContactId").val();

        $.ajax({
            type: 'GET',
            url: '/Account/GetSavedApplications',
            data: { contactId: contactId },
            crossDomain: true,
            success: function (data) {
                
                //$("#myVehiclesContainer").empty();
                //$("#modalAccountMyVehicleContainer #myVehicleHdr").empty();
                //$("#myVehiclesContainer").html(data);

                //$("#modalAccountMyVehicleContainer #myVehicleHdr").text("Vehicles");
                //$("#modalAccountMyVehicleContainer").modal('show');
                $('#hdnMyVehicleSave').val('true');
                $('#showSavedVehicle').html('');
                $('#showSavedVehicle').html(data);
            },
            error: function (data) {
                $("#showSavedVehicle").html("<div class='col-12'><h2 class='empty-content'>No content</h2></div>");

            }
        });
    }

    function saveMyVehicles(applicationId) {
        let contactId = $("#hdnContactId").val();

        var vehicleInfo = {};
        vehicleInfo.contactId = contactId;
        vehicleInfo.applicationId = applicationId;

        $.ajax({
            type: 'POST',
            url: '/Account/SaveVehicles',
            data: { vehicleInfo: vehicleInfo },
            crossDomain: true,
            success: function (data) {
                if (data === 1) generalHandlers.loadSimpleMessage(1, "<p class='mb-0'>Vehicle has been saved successfully to your account</p>", null, null, 2500);
                else if (data === 2) generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Something went wrong</p>", null, null, 2500);
                else if (data === 3) generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>You have already saved this vehicle</p>", null, null, 2500);
            },
            error: function (data) {


            }
        });
    }

    function deleteVehicle(appSerialMappingId) {
        if (appSerialMappingId > 0) {
            $.ajax({
                type: 'POST',
                url: '/Account/DeleteVehicles',
                data: { appSerialMappingId: appSerialMappingId },
                crossDomain: true,
                success: function (data) {
                    loadSaveVehicles();
                    if (data === 1) generalHandlers.loadSimpleMessage(1, "<p class='mb-0'>Vehicle has been deleted successfully.</p>", null, null, 2500);
                    else if (data === 2) generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Something went wrong</p>", null, null, 2500);

                },
                error: function (data) {


                }
            });
        }
    }

    function editVehicle(appSerialMappingId, applicationId, contactId, selectedCountry, selectedState, serialNumber, zip) {
        
        var isEdit = $("#spEdit_" + appSerialMappingId + " i").hasClass('fa-edit');

        if (isEdit) {
            //var selectedCountry = $("#ddlCountry1_" + appSerialMappingId + "#countryName").val();
            $("#spEdit_" + appSerialMappingId + " i").removeClass('fa-edit').addClass('fa-save');
            $("#txtSerial_" + appSerialMappingId).html('').append('<input type="text" class="w-100" id="txSerial_' + appSerialMappingId + '" value="' + serialNumber + '" />');
            $("#ddlCountry1_" + appSerialMappingId).html('').append('<select class="required w-100" id="ddlCountry_' + appSerialMappingId + '" name="ddlCountry_' + appSerialMappingId + '" onchange="generalHandlers.getStatesByCountry(undefined,undefined,' + appSerialMappingId + ')"><option value="">--Select--</option></select>');
            $("#ddlState1_" + appSerialMappingId).html('').append('<select id="ddlState_' + appSerialMappingId + '" name="ddlState_' + appSerialMappingId + '" required placeholder="State" class="required w-100"><option value="">--Select--</option></select>');
            $("#txtZip_" + appSerialMappingId).html('').append('<input type="text" class="w-100" id="txZip_' + appSerialMappingId + '" value="' + zip + '" />');

            $.ajax({
                type: 'POST',
                url: '/Account/GetCountries',
                data: {},
                crossDomain: true,
                success: function (data) {

                    
                    var currentSelectElement = "ddlCountry_" + appSerialMappingId;
                    bindToCountriesDropdown(currentSelectElement, data, "-1", "-- Select --", selectedCountry);

                    
                    if (selectedCountry != "")
                    {
                        generalHandlers.getStatesByCountry(undefined, selectedState, appSerialMappingId);
                    }

                },
                error: function (data) {


                }
            });

        } else {
            saveEdit(appSerialMappingId, applicationId, contactId);
        }
    }

    function bindToCountriesDropdown(id, options, defaultOptValue, defaultOptName, selectedCountryName) {
        
        var element = $("#" + id);
        $("#" + id).html('');
        if (typeof defaultOptValue !== 'undefined' && defaultOptName !== 'undefined') {
            element.append('<option value="' + defaultOptValue + '">' + defaultOptName + '</option>');
        }
        $.each(options, function (k, item) {
            
            if (item.countryName == selectedCountryName) {
                element.append('<option value="' + item.countryId + '" code="' + item.countryCode + '" name="'+ item.countryName + '" selected="selected">' + item.countryName + '</option>');
            }
            else {
                element.append('<option value="' + item.countryId + '" code="' + item.countryCode + '" name="' + item.countryName + '">' + item.countryName + ' </option>');
            }

        });

        if (options.length == 1) {
            $("#" + id).attr("disabled", true);
        }
        $("#" + id).focus();
    }

    function saveEdit(id, appId, contactId) {
        let serialNo = $("#txSerial_" + id).val();
        let countryCode = $("#ddlCountry1_" + id + " #ddlCountry_" + id).find('option:selected').attr("code");
        let countryName = $("#ddlCountry1_" + id + " #ddlCountry_" + id).find('option:selected').attr("name");
        let state = $("#ddlState1_" + id + " #ddlState_" + id).val();
        let zip = $("#txZip_" + id).val();

        if (!saveEditValidateFields(serialNo, countryCode, state, zip)) {
            generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>" + errors + "</p>", null, null, 2500);
            return false;

        }
        else {
            let modifiedFields = {};
            modifiedFields.applicationSerialMappingId = id;
            modifiedFields.applicationId = appId;
            modifiedFields.contactId = contactId;
            modifiedFields.serialNumber = serialNo;
            modifiedFields.applicationSerialMappingsCountry = countryCode;
            modifiedFields.applicationSerialMappingsState = state;
            modifiedFields.applicationSerialMappingsZip = zip;

            $.ajax({
                type: 'POST',
                url: '/Account/UpdateVehicle',
                data: { serials: modifiedFields },
                crossDomain: true,
                success: function (data) {
         
                    if (data === 1) {
                        generalHandlers.loadSimpleMessage(1, "<p class='mb-0'>You have successfully alterd the vehicle.</p>", null, null, 2500);

                        $("#txtSerial_" + id + "#txtSerial_" + id).html('');
                        $("#ddlCountry1_" + id).html('');
                        $("#ddlState1_" + id).html('');
                        $("#txtZip_" + id + "#txtZip_" + id).html('');

                        $("#txtSerial_" + id).html("<div>" + serialNo + "</div>");
                        $("#ddlCountry1_" + id).html("<div>" + countryName + "</div>");
                        $("#ddlState1_" + id).html("<div>" + state + "</div>");
                        $("#txtZip_" + id).html("<div>" + zip + "</div>");

                        $("#spEdit_" + id + " i").removeClass('fa-save');
                        $("#spEdit_" + id + " i").addClass('fa-edit');
                    }
                    else if (data === 2) {
                        generalHandlers.loadSimpleMessage(0, "<p class='mb-0'>Something went wrong</p>", null, null, 2500);
                    }

                },
                error: function (data) {


                }
            });
        }

    }

    function shopVehicle(year, make, model) {
       
        redirectWithAccountCustomization(year, make, model);
    }

    function saveEditValidateFields(serial, country, state, zip) {
        errors = "";
        if (typeof serial == "undefined" || serial == "") {
            errors = "Serial number cannot be empty!";
            return false;
        }
        else if (typeof country === "undefined" || country == "") {
            errors = "Please select a country to proceed!"
            return false;
        }
        else if (typeof state === "undefined" || state == "") {
            errors = "Please select a state to proceed!"
            return false;
        }
        else if (typeof zip === "undefined" || zip == "") {
            errors = "Postal code cannot be empty!"
            return false;
        }
        else {
            return true;
        }

    }

    function loadMyAccountVehicleAddPopup() {

        $("#modalAccountMyVehicleContainer #divVehicleDetails").html("");
        $("#modalAccountMyVehicleContainer").modal('show');

        loadAppMakeDropDown();
    }

    return {

        editAccountInfo: editAccountInfo,
        loadAppMakeDropDown: loadAppMakeDropDown,
        loadSaveVehicles: loadSaveVehicles,
        saveMyVehicles: saveMyVehicles,
        deleteVehicle: deleteVehicle,
        editVehicle: editVehicle,
        shopVehicle: shopVehicle,
        //updateEmail: updateEmail,
        //changePassword: changePassword,
        updateEmailAndPassword: updateEmailAndPassword,
        login: login,
        sendResetPasswordLink: sendResetPasswordLink,
        resetPassword: resetPassword,
        logout: logout,
        create: create,
        continueGuest: continueGuest,
        showContinueGuestButton: showContinueGuestButton,
        loadMyAccountVehicleAddPopup: loadMyAccountVehicleAddPopup
    };

}();



