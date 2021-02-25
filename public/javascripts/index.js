var Dashboard = function() {

    initChart = function() {
        $(".loading_icon").show();
        if (typeof(AmCharts) === 'undefined') {
            return;
        }
        _user_data = $.parseJSON(localStorage.getItem("user_data"));
        var sendInfo = {
            limit: 10000,
            offset: 0
        };
        // $.ajax({
        //     url: base_request_url + "/admin/channel",
        //     type: "GET",
        //     data: sendInfo,
        //     contentType: "application/json",
        //     dataType: "json",
        //     beforeSend: function(xhr) {
        //         xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
        //     },
        //     success: function(data) {
        //         var channel_arr = [];
        //         var total_news = 0;
        //         var total_channels = 0;
        //         var total_followers = 0;
        //         $(data.dataArr).each(function(key, item) {
        //             channel_arr.push({
        //                 "number": item.name,
        //                 "news": item.numberNews,
        //                 "followers": item.numberFollower
        //             });
        //             total_news += parseInt(item.numberNews);
        //             total_channels += 1;
        //             total_followers += parseInt(item.numberFollower);
        //         });
        //         var channel_list = data.dataArr.map(function(a) { return a.name; });
        //         var channel_list_data = [];
        //         var channel_list_followers_data = [];
        //         var colors = Highcharts.getOptions().colors
        //         var color_order = 0;
        //         var bar_news = [];
        //         var bar_followers = [];
        //         $(data.dataArr).each(function(key, item) {
        //             bar_news.push(item.numberNews);
        //             bar_followers.push(item.numberFollower);
        //             channel_list_data.push({
        //                 y: parseFloat(((parseInt(item.numberNews) / total_news) * 100).toFixed(2)),
        //                 color: colors[color_order],
        //                 value: parseInt(item.numberNews)
        //             });
        //             channel_list_followers_data.push({
        //                 y: parseFloat(((parseInt(item.numberFollower) / total_followers) * 100).toFixed(2)),
        //                 color: colors[color_order],
        //                 value: parseInt(item.numberFollower)
        //             });
        //             color_order++;
        //         });
        //         var categories = channel_list,
        //             browserData = [],
        //             followerData = [],
        //             i,
        //             j,
        //             dataLen = channel_list_data.length,
        //             drillDataLen,
        //             brightness;

        //         // Build the data arrays
        //         for (i = 0; i < dataLen; i += 1) {
        //             // add browser data
        //             browserData.push({
        //                 name: categories[i] + " (" + channel_list_data[i].value + ") ",
        //                 y: channel_list_data[i].y,
        //                 color: channel_list_data[i].color
        //             });
        //             followerData.push({
        //                 name: categories[i] + " (" + channel_list_followers_data[i].value + ") ",
        //                 y: channel_list_followers_data[i].y,
        //                 color: channel_list_followers_data[i].color
        //             });
        //         }

        //         // Create the chart1
        //         console.log(browserData);
        //         Highcharts.chart('pieChart1', {
        //             chart: {
        //                 type: 'pie'
        //             },
        //             title: {
        //                 text: 'News by percents'
        //             },
        //             credits: {
        //                 enabled: false
        //             },
        //             plotOptions: {
        //                 pie: {
        //                     shadow: false,
        //                     center: ['50%', '50%']
        //                 }
        //             },
        //             tooltip: {
        //                 valueSuffix: '%'
        //             },
        //             series: [{
        //                 name: 'News',
        //                 data: browserData,
        //                 size: '100%',
        //                 dataLabels: {
        //                     formatter: function() {
        //                         return this.y > 5 ? this.point.name : null;
        //                     },
        //                     color: '#ffffff',
        //                     distance: -30
        //                 }
        //             }]
        //         });

        //         // Create the chart2
        //         Highcharts.chart('pieChart2', {
        //             chart: {
        //                 type: 'pie'
        //             },
        //             title: {
        //                 text: 'Followers by percents'
        //             },
        //             credits: {
        //                 enabled: false
        //             },
        //             plotOptions: {
        //                 pie: {
        //                     shadow: false,
        //                     center: ['50%', '50%']
        //                 }
        //             },
        //             tooltip: {
        //                 valueSuffix: '%'
        //             },
        //             series: [{
        //                 name: 'News',
        //                 data: followerData,
        //                 size: '100%',
        //                 dataLabels: {
        //                     formatter: function() {
        //                         return this.y > 5 ? this.point.name : null;
        //                     },
        //                     color: '#ffffff',
        //                     distance: -30
        //                 }
        //             }]
        //         });

        //         //bar chart
        //         Highcharts.chart('dashboard_barchart', {
        //             chart: {
        //                 type: 'column'
        //             },
        //             title: {
        //                 text: 'Channels statistic'
        //             },
        //             subtitle: {
        //                 text: ''
        //             },
        //             xAxis: {
        //                 categories: channel_list,
        //                 crosshair: true
        //             },
        //             yAxis: {
        //                 min: 0,
        //                 title: {
        //                     text: ''
        //                 }
        //             },
        //             tooltip: {
        //                 headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        //                 pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        //                     '<td style="padding:0">{point.y:.1f}</td></tr>',
        //                 footerFormat: '</table>',
        //                 shared: true,
        //                 useHTML: true
        //             },
        //             plotOptions: {
        //                 column: {
        //                     pointPadding: 0.2,
        //                     borderWidth: 0
        //                 }
        //             },
        //             series: [{
        //                 name: 'News',
        //                 data: bar_news

        //             }, ],
        //             credits: {
        //                 enabled: false
        //             }
        //         });
        //         $(".loading_icon").hide();
        //     },
        //     error: function(xhr, error, thrown) {
        //         if (error == "error" || JSON.parse(xhr.responseText).error == "invalid_token") {
        //             localStorage.removeItem("user_data");
        //             document.location.replace("login");
        //         }
        //     },
        // });

        //widget
        _send_info.data = {
            "limit": 1,
            "offset": 0
        };
        $.ajax({
            url: base_request_url + "/admin/user",
            type: "GET",
            data: _send_info.data,
            contentType: "application/json",
            dataType: "json",
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
            },
            success: function(data) {
                $('.loading_icon').hide();
                $('.total_users_widget').attr("data-value", data.totalRecords);
                $('.total_users_widget').counterUp();
            },
            error: function(err) {
                console.log("error");
                console.log(err.error());
            }
        });
        // $.ajax({
        //     url: base_request_url + "/admin/article",
        //     type: "GET",
        //     data: _send_info.data,
        //     contentType: "application/json",
        //     dataType: "json",
        //     beforeSend: function(xhr) {
        //         xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
        //     },
        //     success: function(data) {
        //         $('.loading_icon').hide();
        //         $('.total_articles_widget').attr("data-value", data.totalRecords);
        //         $('.total_articles_widget').counterUp();
        //     },
        //     error: function(err) {
        //         console.log("error");
        //         console.log(err.error());
        //     }
        // });
        // $.ajax({
        //     url: base_request_url + "/getCommentArticle",
        //     type: "POST",
        //     data: JSON.stringify(_send_info.data),
        //     contentType: "application/json",
        //     dataType: "json",
        //     beforeSend: function(xhr) {
        //         xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
        //     },
        //     success: function(data) {
        //         $('.total_comments_widget').attr("data-value", data.totalRecords);
        //         $('.total_comments_widget').counterUp();
        //     },
        //     error: function(err) {
        //         console.log("error");
        //         console.log(err.error());
        //     }
        // });
        // $.ajax({
        //     url: base_request_url + "/getCommentArticle",
        //     type: "POST",
        //     data: JSON.stringify(_send_info.data),
        //     contentType: "application/json",
        //     dataType: "json",
        //     beforeSend: function(xhr) {
        //         xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
        //     },
        //     success: function(data) {
        //         $('.total_comments_widget').attr("data-value", data.totalRecords);
        //         $('.total_comments_widget').counterUp();
        //     },
        //     error: function(err) {
        //         console.log("error");
        //         console.log(err.error());
        //     }
        // });
        // $.ajax({
        //     url: base_request_url + "/admin/giftcodeEvent",
        //     type: "GET",
        //     data: _send_info.data,
        //     contentType: "application/json",
        //     dataType: "json",
        //     beforeSend: function(xhr) {
        //         xhr.setRequestHeader('Authorization', "bearer " + _user_data.access_token);
        //     },
        //     success: function(data) {
        //         $('.loading_icon').hide();
        //         $('.total_events_widget').attr("data-value", data.totalRecords);
        //         $('.total_events_widget').counterUp();
        //     },
        //     error: function(err) {
        //         console.log("error");
        //         console.log(err.error());
        //     }
        // });
    }

    return {
        init: function() {
            initChart();
        }
    };
}();

if (App.isAngularJsApp() === false) {
    jQuery(document).ready(function() {
        Dashboard.init();
    });
}