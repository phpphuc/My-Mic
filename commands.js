appConfig.commands = [
    {
        phrase: "^(?:start |open )?(?:a )?new tab$",
        action: "openUrl",
        description: "(Start|Open) (a) <b>New Tab</b>"
    },
    {
        phrase: "^(?:go to |open )(.*?\\.\\s?\\S{2,6})(?: *?)?(?:in |and )?(?:a )?(new tab)?$",
        action: "openUrl(keyword)",
        description: "<b>Go to|Open</b> &nbsp;&nbsp;&nbsp; <b>anywebpage.com</b> (in a new tab)"
    },
    {
        phrase: "^(switch|change) tab(s)?$",
        action: "switchTab(right)",
        description: "(Switch|Change) <b>tab</b>(s)"
    },
    {
        phrase: "^(next|previous|close|remove) tab$",
        action: "switchTab(keyword)",
        description: "next|previous|close|remove <b>tab</b>"
    },
    {
        phrase: "^(?:go |switch |change |click |select )(?:to |on |in )?(?:the )?(.*?) tab$",
        action: "switchTab(keyword)",
        description: "Go to|Switch to|Change to|Click the|Select the <b>(nth|title of tab) tab</b>"
    },
    {
        phrase: "^(?:go to )?(?:my |the )?(home(?: *?)?page)$",
        action: "openUrl(keyword)",
        description: "(Go to (my|the)) <b>home page</b>"
    },
];

function findCommandInSpeech(speechText) {
    speechText = speechText.replace(/^ /, "");
    let commandDetected = false;
    let regex;

    for (let i = 0; i < appConfig.commands.length; i++) {
        if (appConfig.commands[i].phrase) {
            let pattern = "^(" + appConfig.commands[i].phrase + ")$";
            try {
                regex = new RegExp(pattern, "i");
            } catch (err) {
                console.log(err);
                continue;
            }

            const regexMatches = speechText.match(regex);
            if (regexMatches) {
                regexMatches.shift();
                commandDetected = true;
                console.log("Speech: " + speechText);
                console.log("Phrase Found: " + appConfig.commands[i].phrase);
                console.log("Action Found: " + appConfig.commands[i].action);
                console.log("Matches: " + JSON.stringify(regexMatches));

                if (appConfig.commands[i].action) {
                    let commandOptions;
                    const actionValue = appConfig.commands[i].action;
                    if (actionValue.includes("(")) {
                        const commandName = actionValue.split("(")[0];
                        commandOptions = actionValue.split("(")[1].slice(0, -1).split(/\s*,\s*/);
                        for (let j = 0; j < commandOptions.length; j++) {
                            if (commandOptions[j] === "keyword") {
                                for (let k = 0; k < regexMatches.length; k++) {
                                    if (k > 0 && regexMatches[k] != null && regexMatches[k] !== "") {
                                        const keywordValue = regexMatches[k];
                                        if (k === 1)
                                            commandOptions[j] = keywordValue;
                                        else
                                            commandOptions.push(keywordValue);
                                    }
                                }
                            }
                        }
                        commandOptions = commandOptions.filter(item => item != null && item !== "keyword");
                        console.log(commandOptions);
                    }
                    const funcName = appConfig.commands[i].action.split("(")[0];
                    if (window[funcName])
                        window[funcName](commandOptions);
                }
                break;
            }
        }
    }
    return commandDetected;
}

function switchTab(optionParam) {
    let targetTabIndex = null;
    if (Array.isArray(optionParam))
        optionParam = optionParam[0];
    if (optionParam == null || optionParam === "")
        optionParam = "next";

    chrome.tabs.query({ currentWindow: true, active: true }, function (activeTabs) {
        const currentTabId = activeTabs[0].id;
        const currentTabIndex = activeTabs[0].index;
        chrome.tabs.query({ currentWindow: true }, function (allTabs) {
            const numTabs = allTabs.length;
            if (isNaN(optionParam)) {
                if (optionParam.match(/^(right|next)/i))
                    targetTabIndex = currentTabIndex + 1;
                else if (optionParam.match(/^(left|previous)/i))
                    targetTabIndex = currentTabIndex - 1;
                else if (optionParam.match(/^last$/i))
                    targetTabIndex = numTabs - 1;
                else if (optionParam.match(/^close|remove$/i))
                    chrome.tabs.remove(currentTabId);
            } else {
                targetTabIndex = optionParam - 1;
            }
            if (targetTabIndex >= numTabs)
                targetTabIndex = 0;
            else if (targetTabIndex < 0)
                targetTabIndex = numTabs - 1;

            if (isNaN(optionParam)) {
                for (let i = 0; i < numTabs; i++) {
                    let urlRegex = new RegExp(optionParam, "i");
                    let urlRegexNoSpaces = new RegExp(optionParam.replace(" ", ""), "i");
                    if (allTabs[i].url.match(urlRegex) || allTabs[i].url.match(urlRegexNoSpaces) || allTabs[i].title.match(urlRegex)) {
                        targetTabIndex = i;
                        if (i !== currentTabId)
                            break;
                    }
                    console.log(
                        "id: " + allTabs[i].id +
                        ", index: " + allTabs[i].index +
                        ", url: " + allTabs[i].url.substring(0, 15) +
                        ", title: " + allTabs[i].title
                    );
                }
            }
            if (targetTabIndex != null)
                chrome.tabs.update(allTabs[targetTabIndex].id, { active: true });
        });
    });
}

function openUrl(urlKeyword, newTabParam, isFocusedParam) {
    console.log(urlKeyword, newTabParam, isFocusedParam);
    let tabName = false;
    window.tabs_array = window.tabs_array || [];

    if (isFocusedParam) {
        isFocusedParam = String(isFocusedParam).match(/^(1|true)$/) ? true : false;
    } else {
        isFocusedParam = true;
    }

    newTabParam = typeof newTabParam === "undefined" ? false : newTabParam;
    if (String(newTabParam).match(/^(new)|^(_blank|1|true)$/))
        newTabParam = true;
    else if (String(newTabParam).match(/^(0|false)$/))
        newTabParam = false;
    else
        tabName = String(newTabParam);

    const googleHomePageUrl = "https://www.google.com/";
    let isHomepage = false;
    let currentTabId, currentTabIndex, currentUrl;

    if (typeof urlKeyword === "undefined" || urlKeyword === "") {
        newTabParam = true;
        urlKeyword = googleHomePageUrl;
    }

    if (Array.isArray(urlKeyword)) {
        for (let i = 1; i < urlKeyword.length; i++) {
            if (urlKeyword[i].match(/new|_blank/))
                newTabParam = true;
            else
                tabName = urlKeyword[i];
            if (i === 1 && urlKeyword[i].match(/^(0|false)$/))
                newTabParam = false;
            if (i === 2 && urlKeyword[i].match(/^(0|false)$/))
                isFocusedParam = false;
        }
        if (urlKeyword[0].match(/home( *?)page/)) {
            isHomepage = true;
            urlKeyword = googleHomePageUrl;
        } else {
            urlKeyword = "http://" + urlKeyword[0].replace(/ /gi, "");
            console.log(urlKeyword);
        }
    } else if (urlKeyword.match(/home( *?)page/)) {
        isHomepage = true;
        urlKeyword = googleHomePageUrl;
    } else if (!urlKeyword.match(/^(http|ftp|file)/i)) {
        urlKeyword = "http://" + urlKeyword;
    }

    chrome.tabs.query({ currentWindow: true, active: true }, function (activeTabs) {
        currentTabId = activeTabs[0].id;
        currentTabIndex = activeTabs[0].index;
        currentUrl = activeTabs[0].url;
        if (activeTabs[0].url === window.location.href)
            newTabParam = true;
        chrome.tabs.query({ currentWindow: true }, function (allTabs) {
            if (tabName) {
                if (tabName.match(/^(http|ftp|file)/i)) {
                    const urlPattern = new RegExp("^(" + tabName + ")", "i");
                    console.log(urlPattern, allTabs, newTabParam, isFocusedParam);
                    if (!currentUrl.match(urlPattern)) {
                        for (let i = 0; i < allTabs.length; i++) {
                            if (allTabs[i].url.match(urlPattern)) {
                                currentTabId = allTabs[i].id;
                                newTabParam = false;
                            }
                        }
                    } else {
                        newTabParam = false;
                    }
                } else {
                    for (let i = 0; i < allTabs.length; i++) {
                        if (window.tabs_array[tabName] === allTabs[i].id) {
                            currentTabId = allTabs[i].id;
                            newTabParam = false;
                        }
                    }
                }
            }

            if (newTabParam) {
                chrome.tabs.create({ url: urlKeyword, active: isFocusedParam }, function (tab) {
                    if (tabName)
                        window.tabs_array[tabName] = tab.id;
                    currentTabId = tab.id;
                    if (!isFocusedParam) {
                        window.background_tab = currentTabId;
                        console.log(window.background_tab);
                        clearTimeout(window.bg_tab_timer);
                        window.bg_tab_timer = setTimeout(() => {
                            window.background_tab = null;
                        }, 5000);
                    }
                });
            } else {
                chrome.tabs.update(currentTabId, { url: urlKeyword, active: isFocusedParam });
                if (!isFocusedParam) {
                    window.background_tab = currentTabId;
                    console.log(window.background_tab);
                    clearTimeout(window.bg_tab_timer);
                    window.bg_tab_timer = setTimeout(() => {
                        window.background_tab = null;
                    }, 5000);
                }
            }
        });
    });
}