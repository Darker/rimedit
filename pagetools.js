// Page Size and View Port Dimension Tools
// http://stevenbenner.com/2010/04/calculate-page-size-and-view-port-position-in-javascript/
//if (!sb_windowTools) { var sb_windowTools = new Object(); };
 
var sb_windowTools = {
    scrollBarPadding: 17, // padding to assume for scroll bars
 
    // EXAMPLE METHODS
 
    // center an element in the viewport
    centerElementOnScreen: function(element) {
        /*var pageDimensions = */this.updateDimensions();
        element.style.top = ((this.pageDimensions.verticalOffset() + this.pageDimensions.windowHeight() / 2) - (this.scrollBarPadding + element.offsetHeight / 2)) + 'px';
        element.style.left = ((this.pageDimensions.windowWidth() / 2) - (this.scrollBarPadding + element.offsetWidth / 2)) + 'px';
        element.style.position = 'absolute';
    },
    centerElementOnScreenFixed: function(element) {
        /*var pageDimensions = */this.updateDimensions();
        element.style.top = ((this.pageDimensions.windowHeight() / 2) - (this.scrollBarPadding + element.offsetHeight / 2)) + 'px';
        element.style.left = ((this.pageDimensions.windowWidth() / 2) - (this.scrollBarPadding + element.offsetWidth / 2)) + 'px';
        element.style.position = 'fixed';
    },
    // INFORMATION GETTERS
 
    // load the page size, view port position and vertical scroll offset
    updateDimensions: function() {
        this.updatePageSize();
        this.updateWindowSize();
        this.updateScrollOffset();
    },
 
    // load page size information
    updatePageSize: function() {
        // document dimensions
        var viewportWidth, viewportHeight;
        if (window.innerHeight && window.scrollMaxY) {
            viewportWidth = document.body.scrollWidth;
            viewportHeight = window.innerHeight + window.scrollMaxY;
        } else if (document.body.scrollHeight > document.body.offsetHeight) {
            // all but explorer mac
            viewportWidth = document.body.scrollWidth;
            viewportHeight = document.body.scrollHeight;
        } else {
            // explorer mac...would also work in explorer 6 strict, mozilla and safari
            viewportWidth = document.body.offsetWidth;
            viewportHeight = document.body.offsetHeight;
        };
        this.pageSize = {
            viewportWidth: viewportWidth,
            viewportHeight: viewportHeight
        };
    },
 
    // load window size information
    updateWindowSize: function() {
        // view port dimensions
        var windowWidth, windowHeight;
        if (self.innerHeight) {
            // all except explorer
            windowWidth = self.innerWidth;
            windowHeight = self.innerHeight;
        } else if (document.documentElement && document.documentElement.clientHeight) {
            // explorer 6 strict mode
            windowWidth = document.documentElement.clientWidth;
            windowHeight = document.documentElement.clientHeight;
        } else if (document.body) {
            // other explorers
            windowWidth = document.body.clientWidth;
            windowHeight = document.body.clientHeight;
        };
        this.windowSize = {
            windowWidth: windowWidth,
            windowHeight: windowHeight
        };
    },
 
    // load scroll offset information
    updateScrollOffset: function() {
        // viewport vertical scroll offset
        var horizontalOffset, verticalOffset;
        if (self.pageYOffset) {
            horizontalOffset = self.pageXOffset;
            verticalOffset = self.pageYOffset;
        } else if (document.documentElement && document.documentElement.scrollTop) {
            // Explorer 6 Strict
            horizontalOffset = document.documentElement.scrollLeft;
            verticalOffset = document.documentElement.scrollTop;
        } else if (document.body) {
            // all other Explorers
            horizontalOffset = document.body.scrollLeft;
            verticalOffset = document.body.scrollTop;
        };
        this.scrollOffset = {
            horizontalOffset: horizontalOffset,
            verticalOffset: verticalOffset
        };
    },
 
    // INFORMATION CONTAINERS
 
    // raw data containers
    pageSize: {},
    windowSize: {},
    scrollOffset: {},
 
    // combined dimensions object with bounding logic
    pageDimensions: {
        pageWidth: function() {
            return sb_windowTools.pageSize.viewportWidth > sb_windowTools.windowSize.windowWidth ?
                sb_windowTools.pageSize.viewportWidth :
                sb_windowTools.windowSize.windowWidth;
        },
        pageHeight: function() {
            return sb_windowTools.pageSize.viewportHeight > sb_windowTools.windowSize.windowHeight ?
                sb_windowTools.pageSize.viewportHeight :
                sb_windowTools.windowSize.windowHeight;
        },
        windowWidth: function() {
            sb_windowTools.updateWindowSize();
            return sb_windowTools.windowSize.windowWidth;
        },
        windowHeight: function() {
            sb_windowTools.updateWindowSize();
            return sb_windowTools.windowSize.windowHeight;
        },
        horizontalOffset: function() {  
            sb_windowTools.updateScrollOffset();
            return sb_windowTools.scrollOffset.horizontalOffset;
        },
        verticalOffset: function() {
            sb_windowTools.updateScrollOffset();
            return sb_windowTools.scrollOffset.verticalOffset;
        }
    }
};
