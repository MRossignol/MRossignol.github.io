(function() {

  let hta = getHTA();
  
  let html = () => {
    // return '<link rel="stylesheet" type="text/css" href="https://assets.tumblr.com/fonts/gibson/stylesheet.css?v=3"><style>figure{margin:0}.tmblr-iframe{position:absolute}.tmblr-iframe.hide{display:none}.tmblr-iframe--amp-cta-button{visibility:hidden;position:fixed;bottom:10px;left:50%;transform:translateX(-50%);z-index:100}.tmblr-iframe--amp-cta-button.tmblr-iframe--loaded{visibility:visible;animation:iframe-app-cta-transition .2s ease-out}</style><ol class="tumblr_posts">\x0a    \x0a        \x0a            <li class="tumblr_post tumblr_text_post">\x0a                \x0a                    <div class="tumblr_title">Test</div>\x0a                \x0a                \x0a                <div class="tumblr_body">\x0a                    <p>Test</p>\x0a                </div>\x0a            </li>\x0a        \x0a\x0a        \x0a\x0a        \x0a\x0a        \x0a        \x0a        \x0a        \x0a        \x0a\x0a                        \x0a    \x0a</ol><script\x0a    defer\x0a    type="application/javascript"\x0a    id="bilmur"\x0a    data-provider="tumblr.com"\x0a    data-service="blognetwork"\x0a    nonce="LSYKwHoN8JWBiYlAJz1Db2g6Qk"\x0a    src="https://s0.wp.com/wp-content/js/bilmur.min.js?m=202238"\x0a  ></script>\x0a\x0a<iframe scrolling="no" width="1" height="1" frameborder="0" style="background-color:transparent; overflow:hidden; position:absolute; top:0; left:0; z-index:9999;" id="ga_target"></iframe>\x0a\x0a<script type="text/javascript">\x0a    (function(){\x0a        var analytics_frame = document.getElementById(\'ga_target\');\x0a        var analytics_iframe_loaded;\x0a        var user_logged_in;\x0a        var blog_is_nsfw = \'No\';\x0a\x0a        var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";\x0a        var eventer = window[eventMethod];\x0a        var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";\x0a        eventer(messageEvent,function(e) {\x0a            var message = (e.data && e.data.split) ? e.data.split(\';\') : \'\';\x0a            switch (message[0]) {\x0a                case \'analytics_iframe_loaded\':\x0a                    analytics_iframe_loaded = true;\x0a                    postCSMessage();\x0a                    postGAMessage();\x0a                    break;\x0a                case \'user_logged_in\':\x0a                    user_logged_in = message[1];\x0a                    postGAMessage();\x0a                    break;\x0a            }\x0a        }, false);\x0a\x0a        analytics_frame.src = "https://assets.tumblr.com/analytics.html?_v=9f5febfd57a8a649c598d888f2d9e062#" +\x0a                              "https://mathiasr.tumblr.com";\x0a        function postGAMessage() {\x0a            if (analytics_iframe_loaded && user_logged_in) {\x0a                var is_ajax = false;\x0a                analytics_frame.contentWindow.postMessage([\'tick_google_analytics\', is_ajax, user_logged_in, blog_is_nsfw, \'/js?route=%2Fjs\'].join(\';\'), analytics_frame.src.split(\'/analytics.html\')[0]);\x0a            }\x0a        }\x0a        function postCSMessage() {\x0a            COMSCORE = true;\x0a            analytics_frame.contentWindow.postMessage(\'enable_comscore;\' + window.location, analytics_frame.src.split(\'/analytics.html\')[0]);\x0a        }\x0a    })();\x0a</script>\x0a\x0a\x0a\x0a    <script type="text/javascript" nonce="LSYKwHoN8JWBiYlAJz1Db2g6Qk">!function(s){s.src=\'https://px.srvcs.tumblr.com/impixu?T=1664088200&J=eyJ0eXBlIjoidXJsIiwidXJsIjoiaHR0cDovL21hdGhpYXNyLnR1bWJsci5jb20vanMiLCJyZXF0eXBlIjowLCJyb3V0ZSI6Ii9qcyJ9&U=JGEPBHIDNJ&K=15cf270381e3ce6780e5f6284ff6b91f34c36176595ac342a6da95adbe8add89&R=\'.replace(/&R=[^&$]*/,\'\').concat(\'&R=\'+escape(document.referrer)).slice(0,2000).replace(/%.?.?$/,\'\');}(new Image());</script><noscript><img style="position:absolute;z-index:-3334;top:0px;left:0px;visibility:hidden;" src="https://px.srvcs.tumblr.com/impixu?T=1664088200&J=eyJ0eXBlIjoidXJsIiwidXJsIjoiaHR0cDovL21hdGhpYXNyLnR1bWJsci5jb20vanMiLCJyZXF0eXBlIjowLCJyb3V0ZSI6Ii9qcyIsIm5vc2NyaXB0IjoxfQ==&U=JGEPBHIDNJ&K=8c73adb9e84aeca28855247c680505ff41eb25d5e24ef05e646c1cbb1ddd47bc&R="></noscript><script type="text/javascript" nonce="LSYKwHoN8JWBiYlAJz1Db2g6Qk">!function(s){s.src=\'https://px.srvcs.tumblr.com/impixu?T=1664088200&J=eyJ0eXBlIjoicG9zdCIsInVybCI6Imh0dHA6Ly9tYXRoaWFzci50dW1ibHIuY29tL2pzIiwicmVxdHlwZSI6MCwicm91dGUiOiIvanMiLCJwb3N0cyI6W3sicG9zdGlkIjoiNjk1Mjk2MTAyMTkwMjY4NDE2IiwiYmxvZ2lkIjo1MTE2ODE0NDAsInNvdXJjZSI6MzN9XX0=&U=HPOEJMICCG&K=83ef57cfd76f7d05801beaf75c87ccf5458029a4a4ce0766c7398dc419a7b7ab&R=\'.replace(/&R=[^&$]*/,\'\').concat(\'&R=\'+escape(document.referrer)).slice(0,2000).replace(/%.?.?$/,\'\');}(new Image());</script><noscript><img style="position:absolute;z-index:-3334;top:0px;left:0px;visibility:hidden;" src="https://px.srvcs.tumblr.com/impixu?T=1664088200&J=eyJ0eXBlIjoicG9zdCIsInVybCI6Imh0dHA6Ly9tYXRoaWFzci50dW1ibHIuY29tL2pzIiwicmVxdHlwZSI6MCwicm91dGUiOiIvanMiLCJwb3N0cyI6W3sicG9zdGlkIjoiNjk1Mjk2MTAyMTkwMjY4NDE2IiwiYmxvZ2lkIjo1MTE2ODE0NDAsInNvdXJjZSI6MzN9XSwibm9zY3JpcHQiOjF9&U=HPOEJMICCG&K=7c789a9c4812c1b9ce0cb5e8320ec7cabdacb021d6b15b444722d1979e9f09ae&R="></noscript><noscript id="bootloader" data-bootstrap="{&quot;Components&quot;:{&quot;PostActivity&quot;:[],&quot;NotificationPoller&quot;:{&quot;messaging_keys&quot;:[],&quot;token&quot;:&quot;c86f8a500596474a7ef5034081f694bd&quot;,&quot;inbox_unread&quot;:0},&quot;DesktopDashboardLogo&quot;:{&quot;animations&quot;:[[&quot;https:\\/\\/assets.tumblr.com\\/images\\/logo\\/hover-animations\\/1.png?_v=161861acded461bb6e995593a3bae835&quot;,&quot;https:\\/\\/assets.tumblr.com\\/images\\/logo\\/hover-animations\\/1@2x.png?_v=496a774637302a598c851381d00009b0&quot;]]},&quot;TumblelogIframe&quot;:{&quot;unified&quot;:true,&quot;variant&quot;:null,&quot;isCompact&quot;:false,&quot;tumblelogBundleSrc&quot;:&quot;https:\\/\\/assets.tumblr.com\\/client\\/prod\\/standalone\\/tumblelog\\/index.build.js?_v=0e147942bfe4bb394faff9af7aa7a974&quot;,&quot;tumblelogName&quot;:&quot;mathiasr&quot;,&quot;isLoggedIn&quot;:false,&quot;isFriend&quot;:false,&quot;formKey&quot;:&quot;&quot;,&quot;canSubscribe&quot;:false,&quot;isSubscribed&quot;:false,&quot;tumblelogTitle&quot;:&quot;Mathias&quot;,&quot;tumblelogAvatar&quot;:&quot;https:\\/\\/64.media.tumblr.com\\/0c176b005705e96ae04d5c1988ff0a54\\/b1160852ebecb39a-26\\/s64x64u_c1\\/c7f39c671255f6d6f6f8a0bdf99f41b458dd2bf4.jpg&quot;,&quot;tumblelogAvatar128&quot;:&quot;https:\\/\\/64.media.tumblr.com\\/0c176b005705e96ae04d5c1988ff0a54\\/b1160852ebecb39a-26\\/s128x128u_c1\\/964ffd1452a91c2fa152a26563fc25e7b3bf472f.jpg&quot;,&quot;tumblelogHost&quot;:&quot;https:\\/\\/mathiasr.tumblr.com&quot;,&quot;isOptica&quot;:true,&quot;isCustomTheme&quot;:false,&quot;themeHeaderImage&quot;:&quot;https:\\/\\/64.media.tumblr.com\\/161fb3c9fb7ee9ce225dc883bf625f56\\/b1160852ebecb39a-48\\/s2048x3072\\/2942e1cc664cc6975e7f734b9d474bdea58acecd.jpg&quot;,&quot;themeBackgroundColor&quot;:&quot;#181818&quot;,&quot;themeTitleColor&quot;:&quot;#700000&quot;,&quot;themeAccentColor&quot;:&quot;#8100a8&quot;,&quot;brag&quot;:true,&quot;canShowAd&quot;:true,&quot;isPremium&quot;:false,&quot;showLrecAds&quot;:false,&quot;showStickyLrecBackfill&quot;:false,&quot;showGeminiAds&quot;:false,&quot;geminiSectionCodeDesktop&quot;:&quot;a10bca9c-0c5d-4a02-ab13-14ab8513d81d&quot;,&quot;geminiSectionCodeMobile&quot;:&quot;ced63809-b609-4aca-96a0-abc099acba6b&quot;,&quot;currentPageType&quot;:null,&quot;currentPage&quot;:1,&quot;searchQuery&quot;:&quot;&quot;,&quot;tag&quot;:&quot;&quot;,&quot;query&quot;:&quot;&quot;,&quot;chrono&quot;:false,&quot;postId&quot;:&quot;&quot;,&quot;src&quot;:&quot;https:\\/\\/mathiasr.tumblr.com\\/js&quot;,&quot;postUrl&quot;:&quot;&quot;,&quot;isBlocked&quot;:null,&quot;isAdmin&quot;:false,&quot;lookupButtonUrl&quot;:&quot;&quot;,&quot;showSpamButton&quot;:false,&quot;showRootPostButton&quot;:false,&quot;rootPostUrl&quot;:&quot;&quot;,&quot;showRadarPostButton&quot;:false,&quot;radarKeys&quot;:&quot;&quot;,&quot;isUniblocked&quot;:false,&quot;isNsfw&quot;:false,&quot;isAdult&quot;:false,&quot;isSpam&quot;:false,&quot;isPrimaryBlog&quot;:false,&quot;canEdit&quot;:false,&quot;canReblogSelf&quot;:false,&quot;showLikeButton&quot;:false,&quot;showReblogButton&quot;:false,&quot;reblogUrl&quot;:&quot;&quot;,&quot;showMessagingButton&quot;:false,&quot;loginCheckIframeSrc&quot;:&quot;https:\\/\\/assets.tumblr.com\\/assets\\/html\\/iframe\\/login_check.html?_v=3de94a184d600617102ddd5b48fb36e9&quot;,&quot;appInstallUrls&quot;:{&quot;android&quot;:&quot;https:\\/\\/play.google.com\\/store\\/apps\\/details?id=com.tumblr\\u0026referrer=utm_source%3Dtumblr%26utm_medium%3Diframe%26utm_campaign%3Dbn_continue_or_install_cta&quot;,&quot;ios&quot;:&quot;https:\\/\\/apps.apple.com\\/app\\/apple-store\\/id305343404?pt=212308\\u0026ct=bn_continue_or_install_cta\\u0026mt=8&quot;},&quot;appOpenReferrer&quot;:&quot;bn_header_open_btn&quot;,&quot;isShowSearch&quot;:true,&quot;supplyLogging&quot;:[],&quot;secondsSinceLastActivity&quot;:-1,&quot;installUrlOpenFailed&quot;:{&quot;android&quot;:&quot;https:\\/\\/play.google.com\\/store\\/apps\\/details?id=com.tumblr\\u0026referrer=utm_source%3Dtumblr%26utm_medium%3Diframe%26utm_campaign%3Dbn_header_app_open_failed&quot;,&quot;ios&quot;:&quot;https:\\/\\/apps.apple.com\\/app\\/apple-store\\/id305343404?pt=212308\\u0026ct=bn_header_app_open_failed\\u0026mt=8&quot;},&quot;loginWallVariant&quot;:&quot;small_center&quot;}},&quot;Flags&quot;:{&quot;features&quot;:&quot;eyJmaWx0ZXJfbnNmdyI6dHJ1ZSwibW9iaWxlX3dlYl9nYXRlIjp0cnVlLCJzYWZlX21vZGUiOnRydWUsInNhZmVfbW9kZV9lbmFibGVkIjp0cnVlLCJrZXljb21tYW5kX2F1dG9fcGFnaW5hdGUiOnRydWUsImxvZ2dlZF9vdXRfc2VhcmNoIjp0cnVlLCJrcmFrZW5fd2ViX2xvZ2dpbmdfbGlicmFyeSI6dHJ1ZSwibGl2ZXBob3Rvc193ZWIiOnRydWUsInVzZXJfdGFnX2ZpbHRlcmluZyI6dHJ1ZSwic2FmZV9tb2RlX293bl9wb3N0Ijp0cnVlLCJwcm9qZWN0X3hfYXBwZWFsIjp0cnVlLCJtb2JpbGVfd2ViX3Bob3Rvc2V0cyI6dHJ1ZSwiaGlkZV9kZWZhdWx0X2hlYWRlcnNfYmxvZ19jYXJkcyI6dHJ1ZSwibm90aWZpY2F0aW9uX3JlcGx5X2xpbmtfdG9fbm90ZXMiOnRydWUsInR5cGluZ19pbmRpY2F0b3Jfd3JpdGUiOnRydWUsInR1bWJscl92aWRlb19zcG9uc29yZWRfZGF5Ijp0cnVlLCJjYXB0Y2hhOnVzZV9yZWNhcHRjaGEyIjp0cnVlLCJsaXR0bGVfc2lzdGVyIjp0cnVlLCJsb2dfbGFkeSI6dHJ1ZSwicmVkcG9wX3Bvc3RfZm9ybV9tb2JpbGVfY3JlYXRlIjp0cnVlLCJsZWdhY3lfcG9zdF9mb3JtX2J1dHRvbnNfbGlua190b19yZWRwb3AiOnRydWUsInNob3dfdHNwX2NsaWNrX3Rocm91Z2hfdG9nZ2xlIjp0cnVlLCJkYXJsYV9hZF9mZWVkYmFjayI6dHJ1ZSwic3RhdHVzX2luZGljYXRvciI6dHJ1ZSwiY29udmVyc2F0aW9uYWxfbm90aWZpY2F0aW9ucyI6dHJ1ZSwiZGlzYWJsZV95YWhvb19iX2Nvb2tpZSI6dHJ1ZSwibGl2ZXBob3RvcyI6dHJ1ZX0=&quot;},&quot;Context&quot;:{&quot;name&quot;:&quot;default&quot;,&quot;time&quot;:1664088200000,&quot;userinfo&quot;:{&quot;primary&quot;:&quot;&quot;,&quot;name&quot;:&quot;&quot;,&quot;channels&quot;:[]},&quot;hosts&quot;:{&quot;assets_host&quot;:&quot;https:\\/\\/assets.tumblr.com&quot;,&quot;secure_assets_host&quot;:&quot;https:\\/\\/assets.tumblr.com&quot;,&quot;www_host&quot;:&quot;https:\\/\\/www.tumblr.com&quot;,&quot;secure_www_host&quot;:&quot;https:\\/\\/www.tumblr.com&quot;,&quot;embed_host&quot;:&quot;https:\\/\\/embed.tumblr.com&quot;,&quot;safe_host&quot;:&quot;https:\\/\\/safe.txmblr.com&quot;,&quot;platform_host&quot;:&quot;https:\\/\\/platform.tumblr.com&quot;},&quot;language&quot;:&quot;en_US&quot;,&quot;language_simple&quot;:&quot;en&quot;,&quot;assets&quot;:&quot;https:\\/\\/assets.tumblr.com\\/client\\/prod\\/&quot;},&quot;Translations&quot;:{&quot;%1$sReport %2$s&#039;s post?%3$sIf it violates our community guidelines, we&#039;ll remove it.%4$s&quot;:&quot;%1$sReport %2$s&#039;s reblog?%3$sIf it violates our community guidelines, we&#039;ll remove it.%4$s&quot;,&quot;%1$sReport %2$s&#039;s reply?%3$sIf it violates our community guidelines, we&#039;ll remove it.%4$s&quot;:&quot;%1$sReport %2$s&#039;s reblog?%3$sIf it violates our community guidelines, we&#039;ll remove it.%4$s&quot;,&quot;%1$sDelete your tip??%2$s&quot;:&quot;%1$sDelete your tip?%2$s&quot;,&quot;Deleting your tip&quot;:&quot;Deleting your tip will only remove it from the replies tab and notes. %1$sYou won&#039;t receive a refund of your tip.%2$s For further help contact %3$sTumblr Support%4$s.&quot;}}"></noscript>\x0a<script src="https://assets.tumblr.com/client/prod/standalone/tumblelog/index.build.js?_v=0e147942bfe4bb394faff9af7aa7a974"></script>\x0a<script src="https://assets.tumblr.com/assets/scripts/tumblelog_post_message_queue.js?_v=a8fadfa499d8cb7c3f8eefdf0b1adfdd"></script>\x0a';
    let content = hta.contentData.about;
    let res = '<div><div class="pageTitle">'+content.title+'</div>';
    content.paragraphs.forEach((html) => {
      res += '<p>'+html+'</p>';
    });
    return res+'</div>';
  };
  
  hta.navigation.registerSection({

    name: 'about',
    
    init: () => {},

    preload: () => {},

    getContent: () => new Promise((resolve, reject) => {
      resolve(html());
    }),

    layout: () => {},

    onResize: () => {},

    onAppearing: () => {},

    onDisappearing: () => {},

    cleanup: () => {}
    
  });
    
}) ();
