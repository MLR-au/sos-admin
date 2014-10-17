"use strict";angular.module("adminApp",["ngCookies","ngSanitize","ngRoute","ui.bootstrap","MessageCenterModule"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl"}).when("/user/create",{templateUrl:"views/user-create.html",controller:"UserCreateCtrl"}).when("/logs",{templateUrl:"views/logs.html",controller:"LogsCtrl"}).when("/user/manage",{templateUrl:"views/user-manage.html",controller:"UserManageCtrl"}).when("/login/:code",{template:"<div></div>",controller:"LoginCtrl"}).when("/forbidden",{templateUrl:"views/forbidden.html"}).otherwise({redirectTo:"/"})}]).factory("authInterceptor",["$rootScope","$q","$window",function(a,b,c){return{request:function(a){return a.headers=a.headers||{},c.localStorage.token&&(a.headers.Authorization="Bearer "+c.localStorage.token),a},response:function(a){return 401===a.status,a||b.when(a)}}}]).config(["$httpProvider",function(a){a.interceptors.push("authInterceptor")}]),angular.module("adminApp").controller("MainCtrl",["$scope","AuthService",function(a,b){a.ready=!1,a.$on("user-logged-in",function(){a.isAdmin=b.claims.admin,a.fullname=b.claims.fullname,a.ready=!0}),a.$on("user-logged-out",function(){a.isAdmin=!1,a.ready=!1}),b.verify(!1),a.login=function(){b.login()},a.logout=function(){b.logout()}}]),angular.module("adminApp").constant("configuration",{development:"https://service.esrc.info",testing:"",production:"https://sos.esrc.unimelb.edu.au",service:"production"}),angular.module("adminApp").service("AuthService",["$location","$routeParams","$http","$rootScope","$timeout","messageCenterService",function a(b,c,d,e,f,g){function h(){n("AuthService.init()"),null===localStorage.getItem("token")?a.login():(n("Found local token. Verifying"),a.verify())}function i(){n("AuthService.login(). Redirecting to login service.");var c=a.service+"/?r="+encodeURIComponent(b.absUrl());window.location=c}function j(){n("AuthService.logout(). Removing local token."),localStorage.removeItem("token"),e.$broadcast("user-logged-out")}function k(){if(n("AuthService.getToken()"),void 0===c.code)a.login();else{n("Found code. Retrieving token.");var e=a.service+"/token/"+c.code+"?r="+encodeURIComponent(b.absUrl());d.get(e).then(function(a){n("Saving token. Redirecting to home page."),localStorage.setItem("token",a.data),b.url("/")},function(b){401===b.status&&a.login()})}}function l(b){n("AuthService.verify()");var c=a.service+"/token";d.get(c).then(function(b){a.claims=b.data.claims,e.$broadcast("user-logged-in")},function(c){401===c.status&&(e.$broadcast("user-logged-out"),b!==!1&&(g.removeShown(),g.add("danger","You are not authorized to use this application. Redirecting you to the login service in 3s.",{status:g.status.shown},{timeout:3e3}),f(function(){g.removeShown(),a.login()},3e3)))})}var m=!0,n=function(a){m&&console.log(a)},a={service:"https://sos.esrc.unimelb.edu.au",token:void 0,verified:!1,init:h,login:i,logout:j,getToken:k,verify:l};return a}]),angular.module("adminApp").controller("LoginCtrl",["$scope","AuthService",function(a,b){b.getToken()}]),angular.module("adminApp").controller("UserCreateCtrl",["$scope","$http","AuthService","configuration","messageCenterService",function(a,b,c,d,e){a.ready=!1,a.$on("user-logged-in",function(){a.isAdmin=c.claims.admin,a.ready=!0}),a.$on("user-logged-out",function(){a.isAdmin=!1,a.ready=!1}),c.verify();var f=d[d.service];console.log(f),a.userdata={},a.validateEmail=function(c){if(void 0!==c&&""!==c){var d=f+"/admin/email/"+c;console.log(d),b.get(d).then(function(b){""!==b.data.userdata&&(e.add("danger","There's already a user with that email address.",{status:e.status.shown}),a.existingUser=b.data.userdata)},function(){e.add("danger","Error trying to check the email address.",{status:e.status.shown})})}else e.removeShown(),a.existingUser=void 0},a.save=function(){if(a.validateEmail(a.userdata.primaryEmail),a.validateEmail(a.userdata.secondaryEmail),!a.existingUser&&void 0!==a.userdata.username&&void 0!==a.userdata.primaryEmail){var c=f+"/admin/user/create";b.post(c,a.userdata).then(function(){e.add("success","User account created.",{status:e.status.shown}),a.userCreated=!0},function(){e.add("danger","Error trying to create the user account.",{status:e.status.shown}),a.failure=!0})}},a.reset=function(){a.existingUser=void 0,a.userCreated=!1,a.failure=!1,a.userdata={},e.removeShown()}}]),angular.module("adminApp").controller("UserManageCtrl",["$scope","$http","AuthService","configuration",function(a,b,c,d){a.ready=!1,a.$on("user-logged-in",function(){a.isAdmin=c.claims.admin,a.ready=!0}),a.$on("user-logged-out",function(){a.isAdmin=!1,a.ready=!1}),c.verify();var e=d[d.service];a.loadUsers=function(){var d=e+"/admin/users";b.get(d).then(function(b){a.users=b.data.users},function(a){401===a.status&&c.verify()})},a.loadUsers();var f=function(b){angular.forEach(a.users,function(c,d){c._id===b._id&&(a.users[d]=b)})};a.access=function(a,d,g){a="allow"===a?"allowAccess":"denyAccess";var h=e+"/admin/user/"+d,i={app:g,action:a};b.put(h,i).then(function(a){f(a.data.userdata)},function(a){401===a.status&&c.verify()})},a.lockAccount=function(a){var d=e+"/admin/user/"+a,g={action:"lockAccount"};b.put(d,g).then(function(a){f(a.data.userdata)},function(a){401===a.status&&c.verify()})},a.deleteAccount=function(d){var f=e+"/admin/user/"+d;b.delete(f).then(function(){angular.forEach(a.users,function(b,c){b._id===d&&a.users.splice(c,1)})},function(a){401===a.status&&c.verify()})},a.appPermission=function(a){return"allow"===a?!0:!1}}]);