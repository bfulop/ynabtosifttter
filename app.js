/**
 * Created by bfulop on 18/07/14.
 */

// add modules
var fs = require('fs');
var chokidar = require('chokidar');

// configuration
var budgetdir = "/Users/bfulop/Dropbox/YNAB/Balint and family budget Before Fresh Start on 2012-04-08~742C2AC5.ynab4";
var siftterLogFile = "/Users/bfulop/Dropbox/IFTTT/Sifttter/purchases.txt";

var init;
var FullBudget;
var watcher;
var LogPurchase;
var CategoryName;
var BudgetCategories;
var updateLogFile;


getCategoryName = function (categories, categoryId) {
    var categoryname = "";
    categories.some(function(element, index, array){
        var searchchildren = element.subCategories.some(function(subelem, subindex, subarray){
            if (subelem.entityId === categoryId) {
                categoryname = subelem.name;
                return true;
            } else {
                return false;
            }
        });
        return searchchildren;
    });
    return categoryname;


};

updateLogFile = function (data) {
    fs.appendFile(siftterLogFile, data, function (err) {
        if (err) throw err;
    });
};

LogPurchase = function (data) {
    var sifttterLine, today;
    today = new Date();
    sifttterLine = "- " + data.items[0].date + " at " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + " - Spent " + Math.abs(data.items[0].amount) + " at " + data.items[1].name + " for " + getCategoryName(BudgetCategories, data.items[0].categoryId) + "\n";
    updateLogFile(sifttterLine);

};

init = function () {
    var processPurchase;
    var getFullBudgetFile;
    var budgetfolder;
    // get budget folder
    budgetfolder = budgetdir + "/" + JSON.parse(fs.readFileSync(budgetdir + '/Budget.ymeta').toString()).relativeDataFolderName;

    // add a module to find Budget.yfull file
    getFullBudgetFile = function () {
        var devicebudgetfiles = fs.readdirSync(budgetfolder + "/devices");
        var step = 0;
        var devicebudget = JSON.parse(fs.readFileSync(budgetfolder + "/devices/" + devicebudgetfiles[step]));
        while (!devicebudget.hasFullKnowledge) {
            step++;
            devicebudget = JSON.parse(fs.readFileSync(budgetfolder + "/devices/" + devicebudgetfiles[step]));
        }
        return JSON.parse(fs.readFileSync(budgetfolder + "/" + devicebudget.deviceGUID + "/Budget.yfull"));
    };

    var falseBudgets = /^(?!MasterCategory\/)\w+/m;

    BudgetCategories = getFullBudgetFile.call(this).masterCategories.filter(function (element) {
        return falseBudgets.test(element.entityId);
    });

    processPurchase = function (path) {
        fs.readFile(path, function (err, data) {
            if (err) throw err;
            LogPurchase(JSON.parse(data));

        });
    };

    watcher = chokidar.watch(budgetfolder, {persistent: true, ignoreInitial: true});
    watcher.on('add', function (path) {
        processPurchase(path);
    });


//    processPurchase('/Users/bfulop/Dropbox/YNAB/Balint and family budget Before Fresh Start on 2012-04-08~742C2AC5.ynab4/data3-787F1717/60-33-4B-D1-EC-9C/A-13783,B-1917,C-33_B-1919.ydiff');



};

init();



