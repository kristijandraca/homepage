import genericProxyHandler from "utils/proxy/handlers/generic";

const widget = {
  api: "https://1001albumsgenerator.com/api/v1/projects/{project}",
  proxyHandler: genericProxyHandler,

  mappings: {
    project: {
      endpoint: "project",
      validate: ["currentAlbum"],
    },
  },
};

export default widget;
