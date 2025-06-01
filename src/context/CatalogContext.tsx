import {
  CatalogContextType,
  GradientColorBasedOnZone,
  MapFeatures,
  ReqGradientColorBasedOnZone,
  SaveResponse,
  VisualizationMode,
  MarkerData,
  MeasurementData,
} from '../types';
import urls from '../urls.json';
import userIdData from '../currentUserId.json';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiRequest from '../services/apiRequest';
import html2canvas from 'html2canvas';
import defaultMapConfig from '../mapConfig.json';
import { isIntelligentLayer } from '../utils/layerUtils';
import { v4 as uuidv4 } from 'uuid';
import { Descendant } from 'slate';

const defaultCaseStudyContent: Descendant[] = [
  {
    type: 'heading-one',
    direction: 'rtl',
    align: 'right',
    children: [{ text: 'التحليل الديموغرافي' }],
  },
  {
    type: 'paragraph',
    direction: 'rtl',
    align: 'right',
    children: [
      {
        text: 'تُظهِر هذه المنطقة أنماطاً ديموغرافية مثيرة للاهتمام قد تؤثر على قرارات الأعمال والسياسات.',
      },
    ],
  },
  {
    type: 'chart-container',
    placeholderType: 'demographic',
    direction: 'rtl',
    align: 'right',
    placeholder: 'مثال على التحليل الديموغرافي. قم بتعديله لإدراج مخطط معين.',
    children: [{ text: '' }],
  },
  {
    type: 'heading-two',
    direction: 'rtl',
    align: 'right',
    children: [{ text: 'الاستنتاجات الرئيسية' }],
  },
  {
    type: 'paragraph',
    direction: 'rtl',
    align: 'right',
    children: [{ text: 'يتكون السكان العمري (25-54) من 47% من السكان الكلي', bold: true }],
  },
  {
    type: 'paragraph',
    direction: 'rtl',
    align: 'right',
    children: [{ text: 'يتم توزيع الجنسين بشكل متوازن عبر جميع المجموعات العمرية' }],
  },
  {
    type: 'paragraph',
    direction: 'rtl',
    align: 'right',
    children: [
      { text: 'يشير النمو السكاني المتعلق بالأعمار (65+) إلى إمكانية الحاجة إلى خدمات مرتبطة' },
    ],
  },
  {
    type: 'paragraph',
    direction: 'rtl',
    align: 'right',
    children: [{ text: 'التحول المتوقع من الشباب إلى السكان المتقدمين العمرية خلال العقد القادم' }],
  },
  {
    type: 'heading-two',
    direction: 'rtl',
    align: 'right',
    children: [{ text: 'التحليل' }],
  },
  {
    type: 'chart-container',
    placeholderType: 'trend',
    direction: 'rtl',
    align: 'right',
    placeholder: 'مثال على التحليل المتوقع. قم بتعديله لإدراج مخطط معين.',
    children: [{ text: '' }],
  },
  {
    type: 'paragraph',
    direction: 'rtl',
    align: 'right',
    children: [
      {
        text: 'يشير الملف الديموغرافي إلى سوق كبيرة ومستقرة مع قاعدة عملية جيدة من الأفراد العمرية. يشير التوزيع الجنسي المتوازن عبر المجموعات العمرية إلى حاجات خدمة مماثلة لكلا العمرين. ينشأ النمو السكاني المتعلق بالأعمار إمكانيات في الرعاية الصحية، والترفيه، والخدمات التقاعدية.',
      },
    ],
  },
  {
    type: 'paragraph',
    direction: 'rtl',
    align: 'right',
    children: [
      {
        text: 'يشير التحليل المتوقع إلى تقدم عمري للسكان مع الزمن، مع تأثيرات لتخطيط العمالة، الطلب الصحي، والحاجات المنزلية. يجب على الشركات النظر في هذه التحولات الديموغرافية عند تطوير سياسات طويلة المدى لهذه المنطقة.',
      },
    ],
  },
];

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export function CatalogProvider(props: { children: ReactNode }) {
  const { authResponse } = useAuth();
  const { children } = props;

  const [formStage, setFormStage] = useState<'catalog' | 'catalogDetails' | 'save'>('catalog');
  const [saveMethod, setSaveMethod] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState<Error | null>(null);
  const [legendList, setLegendList] = useState<string[]>([]);
  const [subscriptionPrice, setSubscriptionPrice] = useState('');
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [selectedContainerType, setSelectedContainerType] = useState<
    'Catalogue' | 'Layer' | 'Home'
  >('Home');

  const [geoPoints, setGeoPoints] = useState<MapFeatures[]>([]);
  const [, setLastGeoIdRequest] = useState<string | undefined>();
  const [, setLastGeoMessageRequest] = useState<string | undefined>();
  const [, setLastGeoError] = useState<Error | null>(null);

  const [selectedColor, setSelectedColor] = useState<{
    name: string;
    hex: string;
  } | null>(null);

  const [openDropdownIndices, setOpenDropdownIndices] = useState<(number | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [saveResponse, setSaveResponse] = useState<SaveResponse | null>(null);
  const [saveResponseMsg, setSaveResponseMsg] = useState('');
  const [saveReqId, setSaveReqId] = useState('');
  const [isAdvanced, setIsAdvanced] = useState<boolean>(false);
  const [isAdvancedMode, setIsAdvancedMode] = useState({});
  const [radiusInput, setRadiusInput] = useState<number | null>(null);
  const [isRadiusMode, setIsRadiusMode] = useState(false);
  const [colors, setColors] = useState<string[][]>([]);
  const [reqGradientColorBasedOnZone, setReqGradientColorBasedOnZone] =
    useState<ReqGradientColorBasedOnZone>({
      prdcer_lyr_id: '',
      change_lyr_name: '',
      based_on_lyr_name: '',
      user_id: '',
      color_grid_choice: [],
      change_lyr_id: '',
      based_on_lyr_id: '',
      coverage_value: 0,
      coverage_property: '',
      color_based_on: '',
    });
  const [gradientColorBasedOnZone, setGradientColorBasedOnZone] = useState<
    GradientColorBasedOnZone[]
  >([]);
  const [chosenPallet, setChosenPallet] = useState(null);
  const [selectedBasedon, setSelectedBasedon] = useState<string>('');
  const [layerColors, setLayerColors] = useState({});
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>('vertex');
  const [deletedLayers, setDeletedLayers] = useState<
    {
      layer: MapFeatures;
      index: number;
      timestamp: number;
    }[]
  >([]);
  const [basedOnLayerId, setBasedOnLayerId] = useState<string | null>(null);
  const [basedOnProperty, setBasedOnProperty] = useState<string | null>(null);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [isMarkersEnabled, setIsMarkersEnabled] = useState<boolean>(false);
  const [caseStudyContent, setCaseStudyContent] = useState<Descendant[]>(defaultCaseStudyContent);
  const [measurements, setMeasurements] = useState<MeasurementData[]>([]);
  const [selectedHomeTab, setSelectedHomeTab] = useState<'LAYER' | 'CATALOG'>('LAYER');

  async function fetchGeoPoints(
    id: string,
    typeOfCard: string,
    callBack?: (country: string, city: string) => void
  ) {
    const apiJsonRequest =
      typeOfCard === 'layer'
        ? {
            prdcer_lyr_id: id,
            user_id: userIdData.user_id,
          }
        : typeOfCard === 'userCatalog'
          ? { prdcer_ctlg_id: id, as_layers: true, user_id: authResponse.localId }
          : { catalogue_dataset_id: id };

    const url =
      typeOfCard === 'layer'
        ? urls.prdcer_lyr_map_data
        : typeOfCard === 'userCatalog'
          ? urls.fetch_ctlg_lyrs
          : urls.http_catlog_data;

    let unprocessedData: MapFeatures | MapFeatures[] | null = null;

    const callData = function (data: MapFeatures | MapFeatures[]) {
      unprocessedData = data;
    };

    try {
      setIsLoading(true);
      const res = await apiRequest({
        url: url,
        method: 'post',
        body: apiJsonRequest,
        isAuthRequest: true,
      });
      if (res?.data?.data) {
        callData(res.data.data);
        setLastGeoMessageRequest(res.data.message);
        setLastGeoIdRequest(res.data.id);
      }
    } catch (error) {
      setIsError(error instanceof Error ? error : new Error('Failed to fetch geo points'));
    } finally {
      setIsError(null);
      setIsLoading(false);
    }

    if (isError) {
      console.error('An error occurred while fetching geo points.');
      return;
    }

    if (unprocessedData) {
      const updatedDataArray = (
        Array.isArray(unprocessedData) ? unprocessedData : [unprocessedData]
      ).map(function (layer) {
        return Object.assign({}, layer, { display: true });
      });
      setGeoPoints(function (prevGeoPoints) {
        return prevGeoPoints.concat(updatedDataArray) as MapFeatures[];
      });

      if (callBack && updatedDataArray[0].city_name)
        callBack(
          updatedDataArray[0].country_name || defaultMapConfig.fallBackCountry,
          updatedDataArray[0].city_name
        );
    }
  }

  function handleAddClick(
    id: string,
    typeOfCard: string,
    callBack?: (city: string, country: string) => void
  ) {
    fetchGeoPoints(id, typeOfCard, callBack);
  }

  function handleStoreUnsavedGeoPoint(geoPoints: any) {
    // Retrieve existing items from local storage
    const existingGeoPoints = JSON.parse(localStorage.getItem('unsavedGeoPoints') || '[]');

    const updatedGeoPoints = [...existingGeoPoints, ...geoPoints].filter(
      layer => !isIntelligentLayer(layer)
    );

    localStorage.setItem('unsavedGeoPoints', JSON.stringify(updatedGeoPoints));
  }

  async function generateThumbnail(): Promise<string> {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) {
      console.warn('Map container not found');
      return '';
    }

    try {
      const canvas = await html2canvas(mapContainer);
      const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      return thumbnailDataUrl;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return '';
    }
  }

  async function handleSaveCatalog() {
    try {
      setIsLoading(true);

      const thumbnailDataUrl = await generateThumbnail();

      const formData = new FormData();

      if (thumbnailDataUrl) {
        const thumbnailBlob = await fetch(thumbnailDataUrl).then(r => r.blob());
        formData.append('image', thumbnailBlob, 'thumbnail.jpg');
      }

      const requestBody = {
        message: 'Save catalog request',
        request_info: {},
        request_body: {
          prdcer_ctlg_name: name,
          subscription_price: subscriptionPrice,
          ctlg_description: description,
          total_records: 0,
          lyrs: geoPoints.map(layer => ({
            layer_id: layer.prdcer_lyr_id,
            points_color: layer.points_color,
          })),
          user_id: authResponse.localId,
          display_elements: {
            details: geoPoints.map(layer => ({
              layer_id: layer.layerId,
              display: layer.display,
              points_color: layer.points_color,
              is_heatmap: layer.is_heatmap,
              is_grid: layer.is_grid,
              is_enabled: layer.is_enabled || true,
              opacity: layer.opacity || 1,
            })),
            markers: markers.map(marker => ({
              id: marker.id,
              name: marker.name,
              description: marker.description,
              coordinates: marker.coordinates,
              timestamp: marker.timestamp,
            })),
            case_study: caseStudyContent,
            measurements: measurements.map(measurement => ({
              id: measurement.id,
              name: measurement.name,
              description: measurement.description,
              sourcePoint: measurement.sourcePoint,
              destinationPoint: measurement.destinationPoint,
              route: measurement.route,
              distance: measurement.distance,
              duration: measurement.duration,
              timestamp: measurement.timestamp,
            })),
          },
        },
      };

      formData.append('req', JSON.stringify(requestBody));

      console.log(requestBody);

      const res = await apiRequest({
        url: urls.save_producer_catalog,
        method: 'post',
        body: formData,
        isAuthRequest: true,
        isFormData: true,
      });

      setSaveResponse(res.data.data);
      setSaveResponseMsg(res.data.message);
      setSaveReqId(res.data.id);
      setFormStage('catalog');
      resetState();
    } catch (error) {
      setIsError(error instanceof Error ? error : new Error('Failed to save catalog'));
    } finally {
      setIsLoading(false);
    }
  }

  function resetFormStage(resetTo: 'catalog') {
    setDescription('');
    setName('');
    setSubscriptionPrice('');
    setSaveResponse(null);
    setIsError(null);
    setFormStage(resetTo);
  }

  function resetState(keepGeoPointsState?: boolean) {
    if (!keepGeoPointsState) {
      setGeoPoints([]);
    }
    setLastGeoIdRequest(undefined);
    setLastGeoMessageRequest(undefined);
    setLastGeoError(null);
    localStorage.removeItem('unsavedGeoPoints');
  }

  function updateLayerColor(layerId: number, newColor: string) {
    setGeoPoints(prevPoints =>
      prevPoints.map(point => {
        if (point.layerId === layerId) {
          return {
            ...point,
            points_color: newColor,
            display: point.display ?? true,
          };
        }
        return point;
      })
    );
  }

  function updateLayerDisplay(layerIndex: number, display: boolean) {
    setGeoPoints(function (prevGeoPoints) {
      const updatedGeoPoints = prevGeoPoints.slice();
      updatedGeoPoints[layerIndex].display = display;
      return updatedGeoPoints;
    });
    // Bounds will be recalculated via useEffect in MapContainer
  }

  function updateLayerHeatmap(layerIndex: number, isHeatmap: boolean) {
    setGeoPoints(function (prevGeoPoints) {
      var updatedGeoPoints = prevGeoPoints.slice();
      updatedGeoPoints[layerIndex].is_heatmap = isHeatmap;
      return updatedGeoPoints;
    });
  }

  function removeLayer(layerIndex: number) {
    if (typeof layerIndex === 'undefined' || layerIndex === null) {
      console.error('Invalid layer index:', layerIndex);
      return;
    }

    setGeoPoints(prevGeoPoints => {
      if (!Array.isArray(prevGeoPoints) || prevGeoPoints.length === 0) {
        return [];
      }

      // Find the layer to be removed
      const removedLayer = prevGeoPoints.find(
        point =>
          // Convert both to same type for comparison
          String(point.layerId) === String(layerIndex)
      );

      if (removedLayer) {
        // Store the removed layer in deletedLayers
        setDeletedLayers(prev => [
          ...prev,
          {
            layer: removedLayer,
            index: layerIndex,
            timestamp: Date.now(),
          },
        ]);

        // Remove the layer from geoPoints
        return prevGeoPoints.filter(point => String(point.layerId) !== String(layerIndex));
      }

      return prevGeoPoints;
    });
  }

  function restoreLayer(timestamp: number) {
    const deletedLayer = deletedLayers.find(layer => layer.timestamp === timestamp);
    if (!deletedLayer) return;

    setGeoPoints(prev => {
      const newLayers = [...prev];
      newLayers.splice(deletedLayer.index, 0, deletedLayer.layer);
      return newLayers;
    });

    setDeletedLayers(prev => prev.filter(layer => layer.timestamp !== timestamp));
  }

  function updateLayerVisualization(layerIndex: number, mode: VisualizationMode) {
    setGeoPoints(function (prevGeoPoints) {
      const updatedGeoPoints = prevGeoPoints.slice();
      updatedGeoPoints[layerIndex] = {
        ...updatedGeoPoints[layerIndex],
        visualization_mode: mode,
        is_heatmap: mode === 'heatmap',
        is_grid: mode === 'grid',
      };
      return updatedGeoPoints;
    });
  }

  async function setGeoPointsWithCb(
    geoPoints: MapFeatures[] | ((prev: MapFeatures[]) => MapFeatures[]),
    cB?: (city: string, country: string) => void
  ) {
    let geoPointsToUse;

    setGeoPoints(prev => {
      geoPointsToUse = typeof geoPoints === 'function' ? geoPoints(prev) : geoPoints;
      return geoPointsToUse;
    });

    if (cB && geoPointsToUse && geoPointsToUse[0].city_name && geoPointsToUse[0].country_name)
      cB(geoPointsToUse[0].city_name, geoPointsToUse[0].country_name);
  }

  async function handleColorBasedZone(
    requestData?: ReqGradientColorBasedOnZone
  ): Promise<GradientColorBasedOnZone[]> {
    const dataToUse = requestData || reqGradientColorBasedOnZone;

    try {
      const res = await apiRequest({
        url: urls.gradient_color_based_on_zone,
        method: 'post',
        body: dataToUse,
        isAuthRequest: true,
      });
      if (res.data?.data && Array.isArray(res.data.data)) {
        setGradientColorBasedOnZone(res.data.data);
        return res.data.data;
      }
      return [];
    } catch (error) {
      console.error('Request failed:', error);
      setIsError(error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  const updateDropdownIndex = (index: number, value: number | null) => {
    setOpenDropdownIndices(prev => {
      const updatedIndices = [...prev];
      updatedIndices[index] = value;
      return updatedIndices;
    });
  };

  function updateLayerGrid(layerIndex: number, isGrid: boolean) {
    setGeoPoints(function (prevGeoPoints) {
      const updatedGeoPoints = prevGeoPoints.slice();
      if (isGrid) {
        // If enabling grid, disable heatmap
        updatedGeoPoints[layerIndex] = {
          ...updatedGeoPoints[layerIndex],
          is_grid: true,
          is_heatmap: false,
        };
      } else {
        updatedGeoPoints[layerIndex] = {
          ...updatedGeoPoints[layerIndex],
          is_grid: false,
        };
      }
      return updatedGeoPoints;
    });
  }

  const updateLayerLegend = (layerId: number, legend: string) => {
    setGeoPoints(prevPoints =>
      prevPoints.map(point =>
        point.layerId === layerId ? { ...point, layer_legend: legend } : point
      )
    );
  };

  async function handleFilteredZone(
    requestData?: ReqGradientColorBasedOnZone
  ): Promise<GradientColorBasedOnZone[]> {
    const dataToUse = requestData || reqGradientColorBasedOnZone;

    try {
      const res = await apiRequest({
        url: urls.filter_based_zone,
        method: 'post',
        body: dataToUse,
        isAuthRequest: true,
      });
      if (res.data?.data && Array.isArray(res.data.data)) {
        setGradientColorBasedOnZone(res.data.data);
        return res.data.data;
      }
      return [];
    } catch (error) {
      console.error('Request failed:', error);
      setIsError(error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  async function handleNameBasedColorZone(
    requestData?: ReqGradientColorBasedOnZone
  ): Promise<GradientColorBasedOnZone[]> {
    const dataToUse = requestData || reqGradientColorBasedOnZone;

    try {
      const res = await apiRequest({
        url: urls.gradient_color_based_on_zone,
        method: 'post',
        body: dataToUse,
        isAuthRequest: true,
      });
      if (res.data?.data && Array.isArray(res.data.data)) {
        setGradientColorBasedOnZone(res.data.data);
        return res.data.data;
      }
      return [];
    } catch (error) {
      console.error('Request failed:', error);
      setIsError(error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  function addMarker(name: string, description: string, coordinates: [number, number]) {
    const newMarker: MarkerData = {
      id: uuidv4(),
      name,
      description,
      coordinates,
      timestamp: Date.now(),
    };

    setMarkers(prevMarkers => {
      const updatedMarkers = [...prevMarkers, newMarker];
      return updatedMarkers;
    });
  }

  function deleteMarker(id: string) {
    setMarkers(prevMarkers => {
      const updatedMarkers = prevMarkers.filter(marker => marker.id !== id);
      return updatedMarkers;
    });
  }

  function addMeasurement(
    name: string,
    description: string,
    sourcePoint: [number, number],
    destinationPoint: [number, number],
    route: any,
    distance: number,
    duration: number
  ) {
    const newMeasurement: MeasurementData = {
      id: uuidv4(),
      name,
      description,
      sourcePoint,
      destinationPoint,
      route,
      distance,
      duration,
      timestamp: Date.now(),
    };

    setMeasurements(prevMeasurements => [...prevMeasurements, newMeasurement]);
  }

  function deleteMeasurement(id: string) {
    setMeasurements(prevMeasurements =>
      prevMeasurements.filter(measurement => measurement.id !== id)
    );
  }

  return (
    <CatalogContext.Provider
      value={{
        formStage,
        saveMethod,
        isLoading,
        isError,
        legendList,
        subscriptionPrice,
        description,
        name,
        setFormStage,
        setSaveMethod,
        setIsLoading,
        setIsError,
        setLegendList,
        setSubscriptionPrice,
        setDescription,
        setName,
        handleAddClick,
        handleSaveCatalog,
        resetFormStage,
        selectedContainerType,
        setSelectedContainerType,
        geoPoints,
        setGeoPoints,
        setGeoPointsWithCb,
        selectedColor,
        setSelectedColor,
        resetState,
        saveResponse,
        saveResponseMsg,
        saveReqId,
        setSaveResponse,
        updateLayerColor,
        updateLayerDisplay,
        updateLayerHeatmap,
        removeLayer,
        isAdvanced,
        setIsAdvanced,
        isAdvancedMode,
        setIsAdvancedMode,
        setRadiusInput,
        radiusInput,
        openDropdownIndices,
        setOpenDropdownIndices,
        updateDropdownIndex,
        colors,
        setColors,
        chosenPallet,
        setChosenPallet,
        reqGradientColorBasedOnZone,
        setReqGradientColorBasedOnZone,
        gradientColorBasedOnZone,
        setGradientColorBasedOnZone,
        handleColorBasedZone,
        selectedBasedon,
        setSelectedBasedon,
        layerColors,
        setLayerColors,
        isRadiusMode,
        setIsRadiusMode,
        updateLayerGrid,
        deletedLayers,
        restoreLayer,
        visualizationMode,
        setVisualizationMode,
        basedOnLayerId,
        setBasedOnLayerId,
        basedOnProperty,
        setBasedOnProperty,
        updateLayerLegend,
        handleStoreUnsavedGeoPoint,
        handleNameBasedColorZone,
        handleFilteredZone,
        markers,
        setMarkers,
        addMarker,
        deleteMarker,
        isMarkersEnabled,
        setIsMarkersEnabled,
        caseStudyContent,
        setCaseStudyContent,
        measurements,
        addMeasurement,
        setMeasurements,
        deleteMeasurement,
        selectedHomeTab,
        setSelectedHomeTab,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalogContext() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalogContext must be used within a CatalogProvider');
  }
  return context;
}
