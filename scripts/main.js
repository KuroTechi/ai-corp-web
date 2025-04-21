import Header from "./Header.js";
import TabsCollection from "./Tabs.js";
import VideoPlayerCollection from "./VideoPlayer.js";
import ExpandableContentCollection from "./ExpandableContents.js";
import SelectCollection from "./Select.js";
import defineScrollBarWidthCSSVar from "./defineScrollBarWidthCSSVar.js";

new Header();
new TabsCollection();
new VideoPlayerCollection();
new ExpandableContentCollection();
new SelectCollection();

defineScrollBarWidthCSSVar();
