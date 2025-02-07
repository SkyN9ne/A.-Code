import Page from "../components/page";
import fsOperation from "../fileSystem";
import helpers from "../utils/helpers";
import Url from "../utils/Url";

export default async function loadPlugin(pluginId) {
  const baseUrl = await helpers.toInternalUri(Url.join(PLUGIN_DIR, pluginId));
  const cacheFile = Url.join(CACHE_STORAGE, pluginId);
  const $script = <script src={Url.join(baseUrl, 'main.js')}></script>;
  document.head.append($script);
  return new Promise((resolve) => {
    $script.onload = async () => {
      const $page = Page('Plugin');
      $page.show = () => {
        actionStack.push({
          id: pluginId,
          action: $page.hide,
        });

        app.append($page);
      };

      $page.onhide = function () {
        actionStack.remove(pluginId);
      };

      if (!await fsOperation(cacheFile).exists()) {
        await fsOperation(CACHE_STORAGE).createFile(pluginId);
      }
      await acode.initPlugin(pluginId, baseUrl, $page, {
        cacheFileUrl: await helpers.toInternalUri(cacheFile),
        cacheFile: fsOperation(cacheFile)
      });
      resolve();
    }
  });
}