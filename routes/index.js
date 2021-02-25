var querystring = require('querystring');
var http = require('http');
var express = require('express');
var cookieParser = require('cookie-parser');
var router = express.Router();

router.get('/login', function (req, res, next) {
	res.render('pages/login');
});
router.get('/login_scoin', function (req, res, next) {
	res.render('pages/login_scoin');
});
router.get('/', function (req, res, next) {
	res.render('pages/index', { menu: '', sub_menu: 'dashboard' });
});
router.get('/dashboard_p', function (req, res, next) {
	res.render('pages/dashboard_p', { menu: 'home', sub_menu: 'dashboard_p' });
});
router.get('/dashboard_p_detail', function (req, res, next) {
	res.render('pages/dashboard_p_detail', { menu: 'home', sub_menu: 'dashboard_p_detail' });
});
router.get('/push_notif', function (req, res, next) {
	res.render('pages/push_notif', { menu: 'home', sub_menu: 'push_notif' });
});
router.get('/landing_page', function (req, res, next) {
	res.render('pages/landing_page', { menu: 'home', sub_menu: 'landing_page' });
});
router.get('/admin_setting', function (req, res, next) {
	res.render('pages/admin_setting', { menu: 'home', sub_menu: 'admin_setting' });
});
router.get('/users_list', function (req, res, next) {
	res.render('pages/users_list', { menu: 'role_manager', sub_menu: 'users_list' });
});
router.get('/roles', function (req, res, next) {
	res.render('pages/roles', { menu: 'role_manager', sub_menu: 'roles' });
});
router.get('/qrcode', function (req, res, next) {
	res.render('pages/qrcode', { menu: 'home', sub_menu: 'qrcode' });
});
router.get('/income_report', function (req, res, next) {
	res.render('pages/income_report', { menu: 'home', sub_menu: 'income_report' });
});
router.get('/outcome_report', function (req, res, next) {
	res.render('pages/outcome_report', { menu: 'home', sub_menu: 'outcome_report' });
});
router.get('/fund_report', function (req, res, next) {
	res.render('pages/fund_report', { menu: 'home', sub_menu: 'fund_report' });
});


router.get('/giftcode_events', function (req, res, next) {
	res.render('pages/giftcode_events', { menu: 'giftcode', sub_menu: 'giftcode_events' });
});
router.get('/giftcode_report', function (req, res, next) {
	res.render('pages/giftcode_report', { menu: 'giftcode', sub_menu: 'giftcode_report' });
});


router.get('/category', function (req, res, next) {
	res.render('pages/category', { menu: 'news', sub_menu: 'category' });
});
router.get('/splay_articles', function (req, res, next) {
	res.render('pages/splay_articles', { menu: 'news', sub_menu: 'splay_articles' });
});
router.get('/channels', function (req, res, next) {
	res.render('pages/channels', { menu: 'news', sub_menu: 'channels' });
});
router.get('/tags', function (req, res, next) {
	res.render('pages/tags', { menu: 'news', sub_menu: 'tags' });
});
router.get('/auto_following', function (req, res, next) {
	res.render('pages/followed_games', { menu: 'news', sub_menu: 'auto_following' });
});
router.get('/news', function (req, res, next) {
	res.render('pages/news', { menu: 'news', sub_menu: 'news' });
});
router.get('/comments', function (req, res, next) {
	res.render('pages/comments', { menu: 'news', sub_menu: 'comments' });
});
router.get('/articles', function (req, res, next) {
	res.render('pages/articles', { menu: 'news', sub_menu: 'articles' });
});
router.get('/search_history', function (req, res, next) {
	res.render('pages/search_history', { menu: 'news', sub_menu: 'search_history' });
});


router.get('/checkin', function (req, res, next) {
	res.render('pages/checkin', { menu: 'checkin', sub_menu: 'lead_checkin' });
});


router.get('/e_wallet', function (req, res, next) {
	res.render('pages/e_wallet', { menu: 'e_wallet', sub_menu: 'e_wallet' });
});
router.get('/e_wallet_history', function (req, res, next) {
	res.render('pages/e_wallet_history', { menu: 'e_wallet', sub_menu: 'e_wallet_history' });
});
router.get('/scoin_history', function (req, res, next) {
	res.render('pages/scoin_history', { menu: 'e_wallet', sub_menu: 'scoin_history' });
});


router.get('/transaction_history', function (req, res, next) {
	res.render('pages/transaction_history', { menu: 'e_wallet', sub_menu: 'transaction_history' });
});
router.get('/deposit_history', function (req, res, next) {
	res.render('pages/deposit_history', { menu: 'e_wallet', sub_menu: 'deposit_history' });
});


router.get('/lucky_setting', function (req, res, next) {
	res.render('pages/lucky_setting', { menu: 'mini_game',sub_menu: 'lucky_spin', sub_sub_menu: 'lucky_setting' });
});
router.get('/spins', function (req, res, next) {
	res.render('pages/spins', { menu: 'mini_game',sub_menu: 'lucky_spin', sub_sub_menu: 'spins' });
});
router.get('/spin_items', function (req, res, next) {
	res.render('pages/spin_items', { menu: 'mini_game',sub_menu: 'lucky_spin', sub_sub_menu: 'spin_items' });
});
router.get('/spin_gifts', function (req, res, next) {
	res.render('pages/spin_gifts', { menu: 'mini_game',sub_menu: 'lucky_spin', sub_sub_menu: 'spin_gifts' });
});
router.get('/spin_result_report', function (req, res, next) {
	res.render('pages/spin_result_report', { menu: 'mini_game',sub_menu: 'lucky_spin', sub_sub_menu: 'spin_result_report' });
});
router.get('/spin_purchase', function (req, res, next) {
	res.render('pages/spin_purchase', { menu: 'mini_game',sub_menu: 'lucky_spin', sub_sub_menu: 'spin_purchase' });
});


router.get('/tournament', function (req, res, next) {
	res.render('pages/tournament', { menu: 'betting', sub_menu: 'tournament' });
});
router.get('/game', function (req, res, next) {
	res.render('pages/game', { menu: 'betting', sub_menu: 'game' });
});
router.get('/team', function (req, res, next) {
	res.render('pages/team', { menu: 'betting', sub_menu: 'team' });
});
router.get('/match', function (req, res, next) {
	res.render('pages/match', { menu: 'betting', sub_menu: 'match' });
});
router.get('/betting_events', function (req, res, next) {
	res.render('pages/betting_events', { menu: 'betting', sub_menu: 'betting_events' });
});
router.get('/bet_setting', function (req, res, next) {
	res.render('pages/bet_setting', { menu: 'betting', sub_menu: 'bet_setting' });
});
router.get('/betting_report', function (req, res, next) {
	res.render('pages/betting_report', { menu: 'betting', sub_menu: 'betting_report' });
});
router.get('/bet_result', function (req, res, next) {
	res.render('pages/bet_result', { menu: 'betting', sub_menu: 'bet_result' });
});

router.get('/mission', function (req, res, next) {
	res.render('pages/mission', { menu: 'mission', sub_menu: 'lead_mission' });
});
router.get('/splay_card', function (req, res, next) {
	res.render('pages/splay_card', { menu: 'mission', sub_menu: 'splay_card' });
});


router.get('/game_list', function (req, res, next) {
	res.render('pages/game_list', { menu: 'game_list', sub_menu: 'game_list_content' });
});
router.get('/tag_list', function (req, res, next) {
	res.render('pages/tag_list', { menu: 'game_list', sub_menu: 'tag_list' });
});
router.get('/event_game', function (req, res, next) {
	res.render('pages/event_game', { menu: 'game_list', sub_menu: 'event_game' });
});
router.get('/game_ranking', function (req, res, next) {
	res.render('pages/game_ranking', { menu: 'game_list', sub_menu: 'game_ranking', sub_sub_menu: 'game_ranking' });
});
router.get('/game_ranking_rank', function (req, res, next) {
	res.render('pages/game_ranking_rank', { menu: 'game_list', sub_menu: 'game_ranking', sub_sub_menu: 'game_ranking', game_ranking_id : req.query.game_ranking_id});
});
router.get('/game_ranking_item', function (req, res, next) {
	res.render('pages/game_ranking_item', { menu: 'game_list', sub_menu: 'game_ranking', sub_sub_menu: 'game_ranking', rank_id : req.query.rank_id, game_ranking_id: req.query.game_ranking_id});
});

router.get('/game_ranking_report', function (req, res, next) {
	res.render('pages/game_ranking_report', { menu: 'game_list', sub_menu: 'game_ranking', sub_sub_menu: 'game_ranking_report'});
});


router.get('/carousel', function (req, res, next) {
	res.render('pages/carousel', { menu: 'simba_web', sub_menu: 'carousel' });
});
router.get('/help_splay', function (req, res, next) {
	res.render('pages/help_splay', { menu: 'simba_web', sub_menu: 'help_splay' });
});
router.get('/vip_splay', function (req, res, next) {
	res.render('pages/vip_splay', { menu: 'simba_web', sub_menu: 'vip_splay' });
});


router.get('/auction', function (req, res, next) {
	res.render('pages/auction', { menu: 'auction', sub_menu: 'auction' });
});
router.get('/auction_report', function (req, res, next) {
	res.render('pages/auction_report', { menu: 'auction', sub_menu: 'auction_report' });
});


router.get('/banner_landing', function (req, res, next) {
	res.render('pages/banner_landing', { menu: 'ads', sub_menu: 'banner_landing' });
});
router.get('/shop', function (req, res, next) {
	res.render('pages/shop', { menu: 'shop', sub_menu: 'shop' });
});
router.get('/shop_item', function (req, res, next) {
	res.render('pages/shop_item', { menu: 'shop', sub_menu: 'shop_item' });
});
router.get('/shop_promotion', function (req, res, next) {
	res.render('pages/shop_promotion', { menu: 'shop', sub_menu: 'shop_promotion' });
});
router.get('/shop_report', function (req, res, next) {
	res.render('pages/shop_report', { menu: 'shop', sub_menu: 'shop_report' });
});
router.get('/banner', function (req, res, next) {
	res.render('pages/banner', { menu: 'ads', sub_menu: 'banner' });
});
router.get('/campaign', function (req, res, next) {
	res.render('pages/campaign', { menu: 'ads', sub_menu: 'campaign' });
});
router.get('/ads_report', function (req, res, next) {
	res.render('pages/ads_report', { menu: 'ads', sub_menu: 'ads_report' });
});
router.get('/banner_report', function (req, res, next) {
	res.render('pages/banner_report', { menu: 'ads', sub_menu: 'ads_report' });
});
router.get('/tool_giftcode', function (req, res, next) {
	res.render('pages/tool_giftcode', { menu: 'tool_giftcode', sub_menu: 'tool_giftcode' });
});
router.get('/tool_giftcode_report', function (req, res, next) {
	res.render('pages/tool_giftcode_report', { menu: 'tool_giftcode', sub_menu: 'tool_giftcode_report' });
});

module.exports = router;