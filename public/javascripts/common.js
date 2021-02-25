var CAPTION_UPDTAE_ERROR = "Có lỗi xảy ra ";

var INVALID_NAME = "Chưa điền Name kìa đại ca";
var INVALID_SERVICE_ID = "Chưa chọn Game kìa đại ca";
var INVALID_BASE_URL="Chưa thêm Base Url kìa đại ca";
var INVALID_PACKAGE_GIFT = "Chưa có mốc trả thưởng nào kìa đại ca";
var INVALID_FROM_OR_TO_DATE = "Chưa set ngày kìa đại ca";

var INVALID_SALE_OFF_PERCENT = "Chưa điền trường sale off";
var INVALID_TYPE_KM = "Chưa chọn Chương trình khuyến mại";
var INVALID_PROMOTION_PRICE = "Chưa thêm giá mới cho khuyến mại";
var INVALID_PROMOTION_QUANTITY = "Chưa thêm số lượng sản phẩm KM";

function validateFormEventGame(packageGiftData) {
    if ($(".txt_add_edit_item_name").val() == "") {
        show_toast_notif("error", CAPTION_UPDTAE_ERROR, INVALID_NAME);
        return false;
    }
    if ($(".txt_add_edit_service_id").val() == ""
            || $(".txt_add_edit_service_id").val() == 0) {
        show_toast_notif("error", CAPTION_UPDTAE_ERROR, INVALID_SERVICE_ID);
        return false;
    }
    if ($(".txt_add_edit_base_url").val() == ""
            || $(".txt_add_edit_base_url").val() == 0) {
        show_toast_notif("error", CAPTION_UPDTAE_ERROR, INVALID_BASE_URL);
        return false;
    }
    if (packageGiftData == "") {
        show_toast_notif("error", CAPTION_UPDTAE_ERROR, INVALID_PACKAGE_GIFT);
        return false;
    }
    if ($(".txt_add_edit_item_from_date").val() == "" 
            || $(".txt_add_edit_item_to_date").val() == "") {
        show_toast_notif("error", CAPTION_UPDTAE_ERROR, INVALID_FROM_OR_TO_DATE);
        return false;
    }
    return true;
}

function validateFormShopItemPromotion() {
    if ($("#promotion_select").val() == null 
        || $("#promotion_select").val() == 0) {
        show_toast_notif("error", CAPTION_UPDTAE_ERROR, INVALID_TYPE_KM);
        return false;
    }
    if ($(".txt_promotion_tag_view").val() == "") {
        show_toast_notif("error", CAPTION_UPDTAE_ERROR, INVALID_SALE_OFF_PERCENT);
        return false;
    }
    if ($(".txt_promotion_price").val() == "") {
        show_toast_notif("error", CAPTION_UPDTAE_ERROR, INVALID_PROMOTION_PRICE);
        return false;
    }
    if ($(".txt_promotion_quantity").val() == "") {
        show_toast_notif("error", CAPTION_UPDTAE_ERROR, INVALID_PROMOTION_QUANTITY);
        return false;
    }
    return true;
}


var URL_CREATE_EVENT_GAME = "/admin/event-game/create";
var URL_UPDATE_EVENT_GAME = "/admin/event-game/update";

var NAME_TEXT_HIGHLIGHTS = "Text Highlights";

//===========================FUNCTION===============================