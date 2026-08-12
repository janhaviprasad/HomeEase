const SERVICE_IMAGES = {
  electricalRepair: require('../../assets/services/electrical-repair.png'),
  plumbingRepair: require('../../assets/services/plumbing-repair.png'),
  homeCleaning: require('../../assets/services/home-cleaning.png'),
  acService: require('../../assets/services/ac-service.png'),
};

export function getServiceImageSource(item) {
  if (!item) {
    return null;
  }

  if (item.imageSource) {
    return item.imageSource;
  }

  if (item.imageKey && SERVICE_IMAGES[item.imageKey]) {
    return SERVICE_IMAGES[item.imageKey];
  }

  if (item.imageUrl) {
    return { uri: item.imageUrl };
  }

  return null;
}
