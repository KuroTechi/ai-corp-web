import BaseComponent from "./BaseComponent.js";
import MatchMedia from "./MatchMedia.js";

const rootSelector = "[data-js-select]";

class Select extends BaseComponent {
  selectors = {
    root: rootSelector,
    originalControl: "[data-js-select-original-control]",
    button: "[data-js-select-button]",
    dropdown: "[data-js-select-dropdown]",
    option: "[data-js-select-option]",
  };
  stateClasses = {
    isExpanded: "is-expanded",
    isSelected: "is-selected",
    isCurrent: "is-current",
    isOnTheLeftSide: "is-on-the-left-side",
    isOnTheRightSide: "is-on-the-right-side",
  };
  stateAttributes = {
    ariaExpanded: "aria-expanded",
    ariaSelected: "aria-selected",
    ariaActiveDescendant: "aria-activedescendant",
  };
  initialState = {
    isExpanded: false,
    currentOptionIndex: null,
    selectedOptionElement: null,
  };

  constructor(rootElement) {
    super();
    // Кастомный селектор
    this.rootElement = rootElement;
    // Оригинальный селектор
    this.originalControlElement = this.rootElement.querySelector(this.selectors.originalControl);
    // Кнопка кастомного селектора
    this.buttonElement = this.rootElement.querySelector(this.selectors.button);
    // Меню кастомного селектора ( список элементов option)
    this.dropdownElement = this.rootElement.querySelector(this.selectors.dropdown);
    //элементы кастомного селектора
    this.optionElements = this.dropdownElement.querySelectorAll(this.selectors.option);
    //проксируемый стейт
    this.state = this.getProxyState({
      ...this.initialState,
      // Ссылка на оригинальный селект, свойство selectedIndex находит option с атрибутом selected
      currentOptionIndex: this.originalControlElement.selectedIndex,
      selectedOptionElement: this.optionElements[this.originalControlElement.selectedIndex],
    });
    //В с какой стороны будет выпадать dropdown
    this.fixDropdownPosition();
    //Фокус для элементов - оригинальный селект / кастомный селект
    this.updateTabIndexes();
    this.bindEvents();
  }

  updateUI() {
    const { isExpanded, currentOptionIndex, selectedOptionElement } = this.state;

    // Выбранный option в кастом. селекте
    const newSelectedOptionValue = selectedOptionElement.textContent.trim();

    // Значение кастомного селекта подставляется в оригинальный селект
    const updateOriginalControl = () => {
      this.originalControlElement.value = newSelectedOptionValue;
    };

    //Меняет текст кнопки кастом.селекта на значение выбранной option
    const updateButton = () => {
      this.buttonElement.textContent = newSelectedOptionValue;

      //Меняет класс у кнопки кастом.селекта, если isExpanded = true, то добавляется/удаляется is-expanded для открытия drowdown
      // и изменения aria-expanded на true/false
      this.buttonElement.classList.toggle(this.stateClasses.isExpanded, isExpanded);
      this.buttonElement.setAttribute(this.stateAttributes.ariaExpanded, isExpanded);

      this.buttonElement.setAttribute(
        this.stateAttributes.ariaActiveDescendant,
        this.optionElements[currentOptionIndex].id
      );
    };

    //Выпадающий список
    const updateDropdown = () => {
      this.dropdownElement.classList.toggle(this.stateClasses.isExpanded, isExpanded);
    };

    const updateOptions = () => {
      this.optionElements.forEach((optionElement, index) => {
        const isCurrent = currentOptionIndex === index;
        const isSelected = selectedOptionElement === optionElement;

        optionElement.classList.toggle(this.stateClasses.isCurrent, isCurrent);
        optionElement.classList.toggle(this.stateClasses.isSelected, isSelected);
        optionElement.setAttribute(this.stateAttributes.ariaSelected, isSelected);
      });
    };

    updateOriginalControl();
    updateButton();
    updateDropdown();
    updateOptions();
  }

  //В с какой стороны будет выпадать dropdown
  fixDropdownPosition() {
    // текущая ширина окна
    const viewportWidth = document.documentElement.clientWidth;
    // x - координата центра текущего viewport ( центр экрана по горизонтали )
    const halfViewportX = viewportWidth / 2;
    // Ширина кнопки, значение координаты x кнопки относительно viewport
    const { width, x } = this.buttonElement.getBoundingClientRect();

    //Координаты центра кнопки по оси x относительно viewport
    const buttonCenterX = x + width / 2;

    const isButtonOnTheLeftViewportSide = buttonCenterX < halfViewportX;
    this.dropdownElement.classList.toggle(this.stateClasses.isOnTheLeftSide, isButtonOnTheLeftViewportSide);
    this.dropdownElement.classList.toggle(this.stateClasses.isOnTheRightSide, !isButtonOnTheLeftViewportSide);
  }

  //Если ширина экрана меньше ширины мобильной версии, то меняет атрибут у кастом.селекта на -1, чтобы он не бралась в фокус
  //А в атрибуте у оригинального селекта менят атрибут на 0, чтобы он брался в фокус
  //И в обратном порядке, если ширина экрана больша мобильной вёрстки - кастом селект tabindex = 0, а у оригинального селекта на -1
  updateTabIndexes(isMobileDevice = MatchMedia.mobile.matches) {
    // {
    //   matches: false / true   <----------- isMobileDevice
    //   media: "(width <= 767.98px)"
    //   onchange: null
    //   }

    // В оригинальтном селекте значение атрибута tabindex меняется в зависимости от isMobileDevice
    //Данная запись -this.element.tabIndex равносильна записи this.element.setAttribute("tabindex", `${isMobileDevice ? 0 : -1}`)
    this.originalControlElement.tabIndex = isMobileDevice ? 0 : -1;

    // Тоже самое , что для оригинального селекта, но только для кнопки в кастомном селекте
    this.buttonElement.tabIndex = isMobileDevice ? 1 : 0;
  }

  //Изменение tabindex атрибута в случае маштабирования экрана пользователем вручную
  onMobileMatchMediaChange = (event) => {
    this.updateTabIndexes(event.matches);
  };

  //Изменения значения isExpanded в стейте для открытия dropdawn
  toggleExpandedState() {
    this.state.isExpanded = !this.state.isExpanded;
  }

  expand() {
    this.state.isExpanded = true;
  }

  collapse() {
    this.state.isExpanded = false;
  }

  //Клик на кнопку кастом.селекта
  onButtonClick = () => {
    this.toggleExpandedState();
  };

  onClick = (event) => {
    const { target } = event;

    const isOutsideDropdownClick = target.closest(this.selectors.dropdown) !== this.dropdownElement;
    const isButtonClick = target === this.buttonElement;

    if (!isButtonClick && isOutsideDropdownClick) {
      this.collapse();
      return;
    }

    const isOptionClick = target.matches(this.selectors.option);

    if (isOptionClick) {
      this.state.selectedOptionElement = target;
      this.state.currentOptionIndex = [...this.optionElements].findIndex((optionElement) => optionElement === target);

      this.collapse();
    }
  };

  onOriginalControlChange = () => {
    this.state.selectedOptionElement = this.optionElements[this.originalControlElement.selectedIndex];
    this.state.currentOptionIndex = this.originalControlElement.selectedIndex;
  };

  // Обработчики
  bindEvents() {
    //Обработчик события change в случае, если пользователь с пк начинает изменять размеры viewport при помощи девтулз, либо маштабирует иным способом
    MatchMedia.mobile.addEventListener("change", this.onMobileMatchMediaChange);

    //Обработчик клика по кнопке кастом. селекта
    this.buttonElement.addEventListener("click", this.onButtonClick);

    document.addEventListener("click", this.onClick);

    this.originalControlElement.addEventListener("change", this.onOriginalControlChange);
  }
}

class SelectCollection {
  constructor() {
    this.init();
  }
  init() {
    document.querySelectorAll(rootSelector).forEach((element) => {
      new Select(element);
    });
  }
}

export default SelectCollection;
