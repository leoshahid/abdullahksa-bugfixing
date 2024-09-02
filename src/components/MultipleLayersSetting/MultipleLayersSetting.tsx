import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import styles from "./MultipleLayersSetting.module.css";
import ColorSelect from "../ColorSelect/ColorSelect";
import { useCatalogContext } from "../../context/CatalogContext";
import { MultipleLayersSettingProps } from "../../types/allTypesAndInterfaces";

function MultipleLayersSetting(props: MultipleLayersSettingProps) {
  const { layerIndex } = props;
  const {
    geoPoints,
    updateLayerDisplay,
    updateLayerHeatmap,
    // updateLayerZone,
    removeLayer,
  } = useCatalogContext();
  const layer = geoPoints[layerIndex];
  
  const {
    prdcer_layer_name,
    is_zone_lyr,
    display,
    is_heatmap
  } = layer;

  const [isZoneLayer, setIsZoneLayer] = useState(is_zone_lyr);
  const [isDisplay, setIsDisplay] = useState(display);
  const [isHeatmap, setIsHeatmap] = useState(is_heatmap);

  useEffect(
    function () {
      setIsZoneLayer(layer.is_zone_lyr);
      setIsDisplay(layer.display);
      setIsHeatmap(layer.is_heatmap);
    },
    [layer.is_zone_lyr, layer.display, layer.is_heatmap]
  );

  // function handleZoneLayerChange() {
  //   updateLayerZone(layerIndex, !isZoneLayer);
  //    setIsZoneLayer(!isZoneLayer);
  // }

  function handleDisplayChange() {
    updateLayerDisplay(layerIndex, !isDisplay);
    setIsDisplay(!isDisplay);
  }

  function handleHeatMapChange() {
    updateLayerHeatmap(layerIndex, !isHeatmap);
    setIsHeatmap(!isHeatmap);
  } 

  function handleRemoveLayer() {
    removeLayer(layerIndex);
  }

  return (
    <div className={styles.container + ' h-20 w-full'}>
      <button className={styles.closeButton} onClick={handleRemoveLayer}>
        <FaTrash />
      </button>
      <div className={styles.label}>
        <span className={styles.text}>{prdcer_layer_name}</span>
      </div>
      <div className={'flex'}>
        <ColorSelect layerIndex={layerIndex} />
      </div>
      <div className={styles.checkboxesContainer}>
        <div className={styles.checkboxContainer}>
          <p className={styles.zl}>Heatmap</p>
          <input
            type="checkbox"
            checked={isHeatmap}
            onChange={handleHeatMapChange}
            className={styles.checkbox}
          />
        </div>
        <div className={styles.checkboxContainer}>
          <p className={styles.zl}>Display</p>
          <input
            type="checkbox"
            checked={isDisplay}
            onChange={handleDisplayChange}
            className={styles.checkbox}
          />
        </div>
      </div>
    </div>
  );
}

export default MultipleLayersSetting;
