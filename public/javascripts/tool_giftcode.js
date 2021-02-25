//page variable

var load_page = function () {
  console.log("abc");
  $(".btn_submit").click(function () {
    $(".loading_icon").show();
    var formData = new FormData($('#main_form')[0]);
    $.ajax({

      url: base_request_url + "/admin/distributeGiftcode",
      type: "POST",
      data: formData,
      cache: false,
      contentType: false,
      timeout: 3000000,
      processData: false,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
      },
      success: function (data) {
        if (data.statusCode == 'T') {
          show_toast_notif("success", "Successfully", "All email sent");
          $('#modal_add_edit').modal('hide');
        } else {
          show_toast_notif("error", "Fail", data.onlyMessage);
        }
        $(".loading_icon").hide();
      },
      error: function (error) {
        show_toast_notif("error", "Fail", "Error '" + error.responseText + "'");
        $(".loading_icon").hide();
      },
    });
  });
};

jQuery(document).ready(function () {
  load_page();
});