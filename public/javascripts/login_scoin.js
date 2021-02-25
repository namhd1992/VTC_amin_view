// var scoin_code = "";
// var base_request_url = 'http://171.244.14.44:8081';
// var Login = function() {
//     return {
//         //main function to initiate the module
//         init: function() {
//             scoin_code = getUrlParameter("code");
//             var post_data = {
//                 "code": scoin_code,
//                 "redirect_uri": "https://graph.vtcmobile.vn/oauth/authorize?client_id=1e43b5be50860a2378ef6f8128a033a5&redirect_uri=" + window.location.protocol + "//" + window.location.host + "/login_scoin&agencyid=0&imei=GEWO4536NGREGR"
//             };
//             $.ajax({
//                 url: base_request_url + "/anonymous/loginScoinFromAdb",
//                 type: "POST",
//                 data: JSON.stringify(post_data),
//                 contentType: "application/json",
//                 success: function(data) {
//                     console.log(data);
//                     localStorage.setItem("user_data", JSON.stringify(data));
//                     localStorage.setItem("scoin_code", scoin_code);
//                     document.location.replace("./login");
//                 },
//                 error: function(error) {
//                     if (error.status == 401) {
//                         document.location.replace("login?error=permission");
//                     }
//                 }
//             });
//         }
//     };
// }();
// var getUrlParameter = function(sParam) {
//     var sPageURL = decodeURIComponent(window.location.search.substring(1)),
//         sURLVariables = sPageURL.split('&'),
//         sParameterName,
//         i;
//     for (i = 0; i < sURLVariables.length; i++) {
//         sParameterName = sURLVariables[i].split('=');
//         if (sParameterName[0] === sParam) {
//             return sParameterName[1] === undefined ? true : sParameterName[1];
//         }
//     }
// };

// jQuery(document).ready(function() {
//     Login.init();
// });