const { forEach } = Array.prototype;

module.exports = function (page, popstate) {
    document.documentElement.classList.remove('is-leaving')
    document.documentElement.classList.add('is-rendering')

    // replace blocks
    for (var i = 0; i < page.blocks.length; i++) {
        document.body.querySelector(`[data-swup="${i}"]`).outerHTML = page.blocks[i]
    }

    // set title
    document.title = page.title;

    this.triggerEvent('contentReplaced')
    this.triggerEvent('pageView')
    setTimeout(() => {
        document.documentElement.classList.remove('is-animating')
    }, 10)

    // handle classes after render
    if (this.options.pageClassPrefix !== false) {
        document.body.className.split(' ').forEach(className => {
            if (className.includes(this.options.pageClassPrefix)) {
                document.body.classList.remove(className)
            }
        })
    }

    page.pageClass.split(' ').forEach(function (className) {
        document.body.classList.add(className)
    })

    // scrolling
    if (!this.options.doScrollingRightAway || this.scrollToElement) {
        this.doScrolling(popstate)
    }

    // detect animation end
    let animatedElements = document.querySelectorAll(this.options.animationSelector)
    let promises = [];
    animatedElements
        ::forEach(element => {
        var promise = new Promise(resolve => {
            element.addEventListener(this.transitionEndEvent, resolve)
        });
        promises.push(promise)
    });

    Promise
        .all(promises)
        .then(() => {
            this.triggerEvent('animationInDone')
            document.documentElement.classList.remove('is-changing')
            document.documentElement.classList.remove('is-rendering')
            document.documentElement.classList.remove('to-' + this.classify(page.url))
        })

    // update current url
    this.getUrl()
}