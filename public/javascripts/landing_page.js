//page variable
var editing_item = null;
var item_name = "Role";
var item_names = "Roles";
var deleted_id = null;
var channel_arr = [];
var page_datatable = null;
_current_page = 1;

var Page_script = function() {
    return {
        //main function
        init: function() {},
    };
}();

var getSectionByPosition = function(dataArr, position) {
    var returnSection = null;
    $(dataArr).each(function(key, item) {
        if (position == item.position) {
            returnSection = item;
        }
    });
    return returnSection;
};

var reload_form = function(data) {
    var i = 1;
    var j = 0;
    for (j = 0; j <= data.dataArr.length - 1; j++) {
        var section = getSectionByPosition(data.dataArr, j);
        if (j == 0) {
            $(".landing_0_image_1").attr("src", getSectionByPosition(section.arrImage, 1).value);
        }
        //load text
        for (i = 1; i <= section.arrText.length; i++) {
            if ($(".landing_" + j + "_sub_" + i).length > 0) {
                if ($(".landing_" + j + "_sub_" + i).prop("tagName") == "INPUT") {
                    $(".landing_" + j + "_sub_" + i).val(getSectionByPosition(section.arrText, i).value);
                }
                if ($(".landing_" + j + "_sub_" + i).prop("tagName") == "TEXTAREA") {
                    $(".landing_" + j + "_sub_" + i).html(getSectionByPosition(section.arrText, i).value);
                }
            }
        }
        //load image
        for (i = 1; i <= section.arrImage.length; i++) {
            if ($(".landing_" + j + "_image_" + i).length > 0) {
                $(".landing_" + j + "_image_" + i).attr("src", getSectionByPosition(section.arrImage, i).value);
                $(".landing_" + j + "_image_" + i + "_hidden").val(getSectionByPosition(section.arrImage, i).value);
            }
        }
        //load button
        for (i = 1; i <= section.arrButton.length; i++) {
            if ($(".landing_" + j + "_button_" + i + "_text").length > 0) {
                var button = JSON.parse(getSectionByPosition(section.arrButton, i).value);
                $(".landing_" + j + "_button_" + i + "_text").val(button.title);
                $(".landing_" + j + "_button_" + i + "_action").val(button.action);
            }
        }
    }
}

var reload_form_metadata = function(data) {
    $(".meta_sub_1").val(data.dataObj.title);
    $(".meta_sub_2").val(data.dataObj.description);
    $(".meta_sub_3").val(data.dataObj.url);
    $(".meta_image_1_hidden").val(data.dataObj.image);
    $(".meta_image_1").attr("src", data.dataObj.image);
}

var load_page = function() {
    $.ajax({
        url: base_request_url + "/anonymous/landingpage",
        type: "GET",
        success: function(data) {
            if (data.onlyMessage == 'Success') {
                reload_form(data);
            } else {
                show_toast_notif("error", "Fail to load landing page data", "Error", function() {
                    //action when click on notif
                });
            }
        },
        error: function(error) {
            show_toast_notif("error", "Fail to load landing page data", "Error '" + error.responseText + "'", function() {
                //action when click on notif
            });
        },
    });
    $.ajax({
        url: base_request_url + "/admin/metadata",
        type: "GET",
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
        },
        success: function(data) {
            if (data.onlyMessage == 'Success') {
                reload_form_metadata(data);
            } else {
                show_toast_notif("error", "Fail to load landing page data", "Error", function() {
                    //action when click on notif
                });
            }
        },
        error: function(error) {
            show_toast_notif("error", "Fail to load landing page data", "Error '" + error.responseText + "'", function() {
                //action when click on notif
            });
        },
    });
};

jQuery(document).ready(function() {
    Page_script.init();
    load_page();

    //action for page
    $(".btn_submit_section_meta").click(function() {
        if ($(".meta_file_1").val() == "") {
            $(".meta_file_1").attr("name", "");
        } else {
            $(".meta_file_1").attr("name", "file");
        }
        var formData = new FormData($('.form_section_meta')[0]);
        $(".loading_icon").show();
        $.ajax({
            url: base_request_url + "/admin/metadata",
            type: "POST",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
            },
            success: function(data) {
                if (data.onlyMessage == 'Success') {
                    show_toast_notif("success", "Successfully", "Saved", function() {
                        //action when click on notif
                    });
                    $.ajax({
                        url: base_request_url + "/admin/metadata",
                        type: "GET",
                        beforeSend: function(xhr) {
                            xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
                        },
                        success: function(data) {
                            if (data.onlyMessage == 'Success') {
                                reload_form_metadata(data);
                            } else {
                                show_toast_notif("error", "Fail to load landing page data", "Error", function() {
                                    //action when click on notif
                                });
                            }
                        },
                        error: function(error) {
                            show_toast_notif("error", "Fail to load landing page data", "Error '" + error.responseText + "'", function() {
                                //action when click on notif
                            });
                        },
                    });
                } else {
                    show_toast_notif("error", "Fail", "Error", function() {
                        //action when click on notif
                    });
                }
                $(".loading_icon").hide();
            },
            error: function(error) {
                $(".loading_icon").hide();
                show_toast_notif("error", "Fail", "Error '" + error.responseText + "'", function() {
                    //action when click on notif
                });
            },
        });
    });
    $(".btn_submit_section_0").click(function() {
        $(".landing_0_sub_1_hidden").val('{"position":"1","value":"' + $(".landing_0_sub_1").val() + '"}');
        if ($(".landing_0_file_1").val() == "") {
            $(".landing_0_file_1").attr("name", "");
        } else {
            $(".landing_0_image_1_hidden").attr("name", "");
        }
        var formData = new FormData($('.form_section_0')[0]);
        $(".loading_icon").show();
        $.ajax({
            url: base_request_url + "/admin/updateLandingage",
            type: "POST",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
            },
            success: function(data) {
                if (data.onlyMessage == 'Success') {
                    show_toast_notif("success", "Successfully", "Saved", function() {
                        //action when click on notif
                    });
                    $.ajax({
                        url: base_request_url + "/anonymous/landingpage",
                        type: "GET",
                        success: function(data) {
                            if (data.onlyMessage == 'Success') {
                                reload_form(data);
                            } else {
                                show_toast_notif("error", "Fail to load landing page data", "Error", function() {
                                    //action when click on notif
                                });
                            }
                        },
                        error: function(error) {
                            show_toast_notif("error", "Fail to load landing page data", "Error '" + error.responseText + "'", function() {
                                //action when click on notif
                            });
                        },
                    });
                } else {
                    show_toast_notif("error", "Fail", "Error", function() {
                        //action when click on notif
                    });
                }
                $(".loading_icon").hide();
            },
            error: function(error) {
                $(".loading_icon").hide();
                show_toast_notif("error", "Fail", "Error '" + error.responseText + "'", function() {
                    //action when click on notif
                });
            },
        });
    });
    $(".btn_submit_section_1").click(function() {
        $(".landing_1_sub_1_hidden").val('{"position":"1","value":"' + $(".landing_1_sub_1").val() + '"}');
        $(".landing_1_sub_2_hidden").val('{"position":"2","value":"' + $(".landing_1_sub_2").val() + '"}');
        if ($(".landing_1_file_1").val() == "") {
            $(".landing_1_file_1").attr("name", "");
        } else {
            $(".landing_1_image_1_hidden").attr("name", "");
        }
        $(".landing_1_button_1_hidden").val('{"position":"1","value":{"title":"' + $(".landing_1_button_1_text").val() + '","action":"' + $(".landing_1_button_1_action").val() + '"}}');
        var formData = new FormData($('.form_section_1')[0]);
        $(".loading_icon").show();
        $.ajax({
            // http://10.0.1.14:8080
            url: base_request_url + "/admin/updateLandingage",
            type: "POST",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
            },
            success: function(data) {
                if (data.onlyMessage == 'Success') {
                    show_toast_notif("success", "Successfully", "Saved", function() {
                        //action when click on notif
                    });
                    $.ajax({
                        url: base_request_url + "/anonymous/landingpage",
                        type: "GET",
                        success: function(data) {
                            if (data.onlyMessage == 'Success') {
                                reload_form(data);
                            } else {
                                show_toast_notif("error", "Fail to load landing page data", "Error", function() {
                                    //action when click on notif
                                });
                            }
                        },
                        error: function(error) {
                            show_toast_notif("error", "Fail to load landing page data", "Error '" + error.responseText + "'", function() {
                                //action when click on notif
                            });
                        },
                    });
                } else {
                    show_toast_notif("error", "Fail", "Error", function() {
                        //action when click on notif
                    });
                }
                $(".loading_icon").hide();
            },
            error: function(error) {
                $(".loading_icon").hide();
                show_toast_notif("error", "Fail", "Error '" + error.responseText + "'", function() {
                    //action when click on notif
                });
            },
        });
    });
    $(".btn_submit_section_2").click(function() {
        for (var i = 1; i <= 8; i++) {
            $(".landing_2_sub_" + i + "_hidden").val('{"position":"' + i + '","value":"' + $(".landing_2_sub_" + i).val() + '"}');
        }
        var formData = new FormData($('.form_section_2')[0]);
        $(".loading_icon").show();
        $.ajax({
            // http://10.0.1.14:8080
            url: base_request_url + "/admin/updateLandingage",
            type: "POST",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
            },
            success: function(data) {
                if (data.onlyMessage == 'Success') {
                    show_toast_notif("success", "Successfully", "Saved", function() {
                        //action when click on notif
                    });
                    $.ajax({
                        url: base_request_url + "/anonymous/landingpage",
                        type: "GET",
                        success: function(data) {
                            if (data.onlyMessage == 'Success') {
                                reload_form(data);
                            } else {
                                show_toast_notif("error", "Fail to load landing page data", "Error", function() {
                                    //action when click on notif
                                });
                            }
                        },
                        error: function(error) {
                            show_toast_notif("error", "Fail to load landing page data", "Error '" + error.responseText + "'", function() {
                                //action when click on notif
                            });
                        },
                    });
                } else {
                    show_toast_notif("error", "Fail", "Error", function() {
                        //action when click on notif
                    });
                }
                $(".loading_icon").hide();
            },
            error: function(error) {
                $(".loading_icon").hide();
                show_toast_notif("error", "Fail", "Error '" + error.responseText + "'", function() {
                    //action when click on notif
                });
            },
        });
    });
    $(".btn_submit_section_3").click(function() {
        var k = 1;
        for (k = 1; k <= 12; k++) {
            $(".landing_3_sub_" + k + "_hidden").val('{"position":"' + k + '","value":"' + $(".landing_3_sub_" + k).val() + '"}');
        }
        if ($(".landing_3_file_1").val() == "") {
            $(".landing_3_file_1").attr("name", "");
        } else {
            $(".landing_3_image_1_hidden").attr("name", "");
        }
        var formData = new FormData($('.form_section_3')[0]);
        $(".loading_icon").show();
        $.ajax({
            // http://10.0.1.14:8080
            url: base_request_url + "/admin/updateLandingage",
            type: "POST",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
            },
            success: function(data) {
                if (data.onlyMessage == 'Success') {
                    show_toast_notif("success", "Successfully", "Saved", function() {
                        //action when click on notif
                    });
                    $.ajax({
                        url: base_request_url + "/anonymous/landingpage",
                        type: "GET",
                        success: function(data) {
                            if (data.onlyMessage == 'Success') {
                                reload_form(data);
                            } else {
                                show_toast_notif("error", "Fail to load landing page data", "Error", function() {
                                    //action when click on notif
                                });
                            }
                        },
                        error: function(error) {
                            show_toast_notif("error", "Fail to load landing page data", "Error '" + error.responseText + "'", function() {
                                //action when click on notif
                            });
                        },
                    });
                } else {
                    show_toast_notif("error", "Fail", "Error", function() {
                        //action when click on notif
                    });
                }
                $(".loading_icon").hide();
            },
            error: function(error) {
                $(".loading_icon").hide();
                show_toast_notif("error", "Fail", "Error '" + error.responseText + "'", function() {
                    //action when click on notif
                });
            },
        });
    });
    $(".btn_submit_section_4").click(function() {
        $(".landing_4_sub_1_hidden").val('{"position":"1","value":"' + $(".landing_4_sub_1").val() + '"}');
        $(".landing_4_sub_2_hidden").val('{"position":"2","value":"' + $(".landing_4_sub_2").val() + '"}');
        if ($(".landing_4_file_1").val() == "") {
            $(".landing_4_file_1").attr("name", "");
        } else {
            $(".landing_4_image_1_hidden").attr("name", "");
        }
        if ($(".landing_4_file_2").val() == "") {
            $(".landing_4_file_2").attr("name", "");
        } else {
            $(".landing_4_image_2_hidden").attr("name", "");
        }
        if ($(".landing_4_file_3").val() == "") {
            $(".landing_4_file_3").attr("name", "");
        } else {
            $(".landing_4_image_3_hidden").attr("name", "");
        }
        var formData = new FormData($('.form_section_4')[0]);
        $(".loading_icon").show();
        $.ajax({
            url: base_request_url + "/admin/updateLandingage",
            type: "POST",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
            },
            success: function(data) {
                if (data.onlyMessage == 'Success') {
                    show_toast_notif("success", "Successfully", "Saved", function() {
                        //action when click on notif
                    });
                    $.ajax({
                        url: base_request_url + "/anonymous/landingpage",
                        type: "GET",
                        success: function(data) {
                            if (data.onlyMessage == 'Success') {
                                reload_form(data);
                            } else {
                                show_toast_notif("error", "Fail to load landing page data", "Error", function() {
                                    //action when click on notif
                                });
                            }
                        },
                        error: function(error) {
                            show_toast_notif("error", "Fail to load landing page data", "Error '" + error.responseText + "'", function() {
                                //action when click on notif
                            });
                        },
                    });
                } else {
                    show_toast_notif("error", "Fail", "Error", function() {
                        //action when click on notif
                    });
                }
                $(".loading_icon").show();
            },
            error: function(error) {
                $(".loading_icon").hide();
                show_toast_notif("error", "Fail", "Error '" + error.responseText + "'", function() {
                    //action when click on notif
                });
            },
        });
    });
    $(".btn_submit_section_5").click(function() {
        $(".landing_5_sub_1_hidden").val('{"position":"1","value":"' + $(".landing_5_sub_1").val() + '"}');
        $(".landing_5_sub_2_hidden").val('{"position":"2","value":"' + $(".landing_5_sub_2").val() + '"}');
        $(".landing_5_button_1_hidden").val('{"position":"1","value":{"title":"' + $(".landing_5_button_1_text").val() + '","action":"' + $(".landing_5_button_1_action").val() + '"}}');
        $(".landing_5_button_2_hidden").val('{"position":"2","value":{"title":"' + $(".landing_5_button_2_text").val() + '","action":"' + $(".landing_5_button_2_action").val() + '"}}');
        var formData = new FormData($('.form_section_5')[0]);
        $(".loading_icon").show();
        $.ajax({
            // http://10.0.1.14:8080
            url: base_request_url + "/admin/updateLandingage",
            type: "POST",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
            },
            success: function(data) {
                if (data.onlyMessage == 'Success') {
                    show_toast_notif("success", "Successfully", "Saved", function() {
                        //action when click on notif
                    });
                    $.ajax({
                        url: base_request_url + "/anonymous/landingpage",
                        type: "GET",
                        success: function(data) {
                            if (data.onlyMessage == 'Success') {
                                reload_form(data);
                            } else {
                                show_toast_notif("error", "Fail to load landing page data", "Error", function() {
                                    //action when click on notif
                                });
                            }
                        },
                        error: function(error) {
                            show_toast_notif("error", "Fail to load landing page data", "Error '" + error.responseText + "'", function() {
                                //action when click on notif
                            });
                        },
                    });
                } else {
                    show_toast_notif("error", "Fail", "Error", function() {
                        //action when click on notif
                    });
                }
                $(".loading_icon").hide();
            },
            error: function(error) {
                $(".loading_icon").hide();
                show_toast_notif("error", "Fail", "Error '" + error.responseText + "'", function() {
                    //action when click on notif
                });
            },
        });
    });
    $(".btn_submit_section_6").click(function() {
        $(".landing_6_sub_1_hidden").val('{"position":"1","value":"' + $(".landing_6_sub_1").val() + '"}');
        $(".landing_6_sub_2_hidden").val('{"position":"2","value":"' + $(".landing_6_sub_2").val() + '"}');
        $(".landing_6_sub_3_hidden").val('{"position":"3","value":"' + $(".landing_6_sub_3").val() + '"}');
        $(".landing_6_sub_4_hidden").val('{"position":"4","value":"' + $(".landing_6_sub_4").val() + '"}');
        var formData = new FormData($('.form_section_6')[0]);
        $(".loading_icon").show();
        $.ajax({
            // http://10.0.1.14:8080
            url: base_request_url + "/admin/updateLandingage",
            type: "POST",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
            },
            success: function(data) {
                if (data.onlyMessage == 'Success') {
                    show_toast_notif("success", "Successfully", "Saved", function() {
                        //action when click on notif
                    });
                    $.ajax({
                        url: base_request_url + "/anonymous/landingpage",
                        type: "GET",
                        success: function(data) {
                            if (data.onlyMessage == 'Success') {
                                reload_form(data);
                            } else {
                                show_toast_notif("error", "Fail to load landing page data", "Error", function() {
                                    //action when click on notif
                                });
                            }
                        },
                        error: function(error) {
                            show_toast_notif("error", "Fail to load landing page data", "Error '" + error.responseText + "'", function() {
                                //action when click on notif
                            });
                        },
                    });
                } else {
                    show_toast_notif("error", "Fail", "Error", function() {
                        //action when click on notif
                    });
                }
                $(".loading_icon").hide();
            },
            error: function(error) {
                $(".loading_icon").hide();
                show_toast_notif("error", "Fail", "Error '" + error.responseText + "'", function() {
                    //action when click on notif
                });
            },
        });
    });

});