//   prettier-ignore
class Tabs {

  selectors = {
    root: "[data-js-tabs]",
    button: "[data-js-tabs-button]",
    content: "[data-js-tabs-content]",
  };

  stateClasses = {
    isActive: "is-active",
  };

  stateAttributes = {
    ariaSelected: "aria-selected",
    tabIndex: "tabindex",
  };


  constructor(rootElement) {
    this.rootElement = rootElement;
    this.buttonElements = this.rootElement.querySelectorAll(this.selectors.button);
    this.contentElements = this.rootElement.querySelectorAll(this.selectors.content);

    this.state = {
      activeTabIndex: [...this.buttonElements].findIndex((buttonElement) =>
        buttonElement.classList.contains(this.stateClasses.isActive)
      ),
    };
    this.limitTabsIndex = this.buttonElements.length - 1;
    this.bindEvents();
  }


  updateUI() {
    console.log(this);
    const { activeTabIndex } = this.state;

    this.buttonElements.forEach((buttonElement, index) => {
      const isActive = index === activeTabIndex;
      buttonElement.classList.toggle(this.stateClasses.isActive, isActive);
    });

    this.contentElements.forEach((contentElements, index) => {
      const isActive = index === activeTabIndex;
      contentElements.classList.toggle(this.stateClasses.isActive, isActive);
    });
  }


  activateTab(newTabIndex) {
    this.state.activeTabIndex = newTabIndex;
    this.buttonElements[newTabIndex].focus();
  }


  previousTab = () => {
    const newTabIndex = this.state.activeTabIndex === 0 ? this.limitTabsIndex : this.state.activeTabIndex - 1;
    this.activateTab(newTabIndex);
  };


  nextTab = () => {
    const newTabIndex = this.state.activeTabIndex === this.limitTabsIndex ? 0 : this.state.activeTabIndex + 1;
    this.activateTab(newTabIndex);
  };



  firstTab = () => {
    this.activateTab(0);
  };



  lastTab = () => {
    thid.activateTab(this.limitTabsIndex);
  };


  onButtonClick(buttonIndex) {
    this.state.activeTabIndex = buttonIndex;
    this.updateUI();
  }




  onKeyDown = (event) => {

    const { code, metaKey } = event;

    const action = {

      ArrowLeft: this.previousTab,
      ArrowRight: this.nextTab,
      Home: this.firstTab,
      End: this.lastTab,

    }[code];



    const isMacHomeKey = metaKey && code === "ArrowLeft";
    if (isMacHomeKey) {
      this.firstTab();
      this.updateUI();
      return;
    }
    const isMacEndKey = metaKey && code === "ArrowRight";
    if (isMacEndKey) {
      this.lastTab();
      this.updateUI();
      return;
    }

    if (action) {
      action();
      this.updateUI();
    }

  };

  bindEvents() {
    this.buttonElements.forEach((buttonElement, index) => {
      buttonElement.addEventListener("click", () => {
        this.onButtonClick(index);
      });
    });
    this.rootElement.addEventListener("keydown", this.onKeyDown);
  }
}

// Находит все элементы с атрибутом rootSelector = '[data-js-tabs]'
// Итерируется по этим элементам и в класс Tabs передаёт каждый элемент
class TabsCollection {
  constructor() {
    this.init();
  }
  init() {
    document.querySelectorAll("[data-js-tabs]").forEach((element) => {
      new Tabs(element);
    });
  }
}

export default TabsCollection;
