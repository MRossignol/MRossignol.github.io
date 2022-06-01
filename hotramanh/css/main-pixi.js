body {
    font-size: 18px;
    font-family: Verdana, sans-serif;
    overflow: hidden;
    background-color: black;
}

div.backgroundTranslator {
    position: fixed;
    top: 0px;
    left: 0px;
}

div.background {
    position: absolute;
    background-repeat: no-repeat;
    opacity: 0;
    transition: opacity .5s;
}

div#background-ld {
    background-image: url("../img/000061-small-comp.webp");
    background-size: 100% 100%;
    background-position: top left;
    filter: blur(3px);
    z-index: 1;
}

div#background-hd {
    z-index: 2;
}

div.contentWrapper {
    display: grid;
    width: 960px;
    margin: 50px auto 50px auto;
    position: relative;
    z-index: 10;
    background-color: rgba(0, 0, 0, .5);
}

div.content {
    color: white;
    grid-column: 1;
    grid-row: 1;
    line-height: 1.5em;
    padding: 24px;
}

@keyframes content-insert {
    from {
	filter: blur(10px);
	opacity: 0;
    }
    to {
	filter: blur(0px);
	opacity: 1;
    }
}

div.content.insert {
    animation: content-insert 1s ease-in;
}

@keyframes content-remove {
    from {
	filter: blur(0px);
	opacity: 1;
    }
    to {
	filter: blur(10px);
	opacity: 0;
    }
}

div.content.remove {
    animation: content-remove 1s ease-out;
}

div.linkBox {
    width: 100%;
    display: flex;
    flex-direction: row;
    margin-top: 30px;
    position: relative;
    z-index: 10;
    /* background-color: rgba(0, 0, 0, .5); */
    padding: 16px;
}

div.linkSpacer {
    flex: 1 1 10px;
}

a.topLink {
    color: #ccc;
    cursor: pointer;
}

a.topLink.active {
    color: white;
}

img.illus {
    width: 500px;
    height: auto;
}
