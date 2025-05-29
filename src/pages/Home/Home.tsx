import { useNavigate } from 'react-router-dom';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FaBoxOpen, FaLayerGroup } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import LayerFormLoader from '../../components/LayerFormLoader/LayerFormLoader';
import CatalogFormLoader from '../../components/CatalogFormLoader/CatalogFormLoader';
import DataContainer from '../../components/DataContainer/DataContainer';
import { useUIContext } from '../../context/UIContext';
import { useCatalogContext } from '../../context/CatalogContext';
import BottomDrawer from '../../components/BottomDrawer/BottomDrawer';
import { useLayerContext } from '../../context/LayerContext';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const nav = useNavigate();
  const isInitialMount = useRef(true);

  const [selectedTab] = useState<'LAYER' | 'CATALOG'>('LAYER');

  const { openModal } = useUIContext();
  const [_, setHasOpened] = useState(false);

  const { setSelectedContainerType } = useCatalogContext();

  useEffect(() => {
    setSelectedContainerType('Home');
    openModal(<DataContainer />, {
      darkBackground: true,
    });
    setHasOpened(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated && selectedTab === 'CATALOG') nav('/auth');
  }, [selectedTab]);

  const { isMobile, setIsDrawerOpen, isDrawerOpen } = useUIContext();
  return (
    <>
      {!isMobile && (
        <div className="lg:block hidden w-96 h-full pr-1 pb-1 bg-[#115740]">
          <HomeContent />
        </div>
      )}
      {isMobile && (
        <>
          <button
            className="bg-white border p-2.5 fixed w-full bottom-0 left-0 right-0 z-[5] flex items-center gap-2 text-gray-400 font-normal"
            onClick={() => setIsDrawerOpen(true)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              stroke="currentColor"
            >
              <path
                d="M18 15L12 9L6 15"
                stroke-width="1.5"
                stroke-miterlimit="16"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Tap to see more options
          </button>
          <HomerDrawer />
        </>
      )}
    </>
  );
};

export function HomeContent() {
  const { isAuthenticated } = useAuth();
  const nav = useNavigate();

  const {
    setSelectedContainerType,
    geoPoints,
    handleStoreUnsavedGeoPoint,
    setMarkers,
    setIsMarkersEnabled,
    selectedHomeTab,
    setSelectedHomeTab,
    setGeoPoints,
  } = useCatalogContext();

  const handleTabSwitch = (tab: 'LAYER' | 'CATALOG') => {
    setSelectedHomeTab(tab);
    console.log('handleTabSwitch received:', tab);
    setSelectedContainerType(tab === 'CATALOG' ? 'Catalogue' : 'Layer');
    setGeoPoints([]);
    setIsMarkersEnabled(tab === 'CATALOG');
    setMarkers([]);
  };

  useEffect(() => {
    if (!isAuthenticated && selectedHomeTab === 'CATALOG') nav('/auth');
  }, [selectedHomeTab]);

  return (
    <div className="flex-1 h-full flex flex-col relative overflow-hidden ">
      {/* Tabs */}
      <div className="flex  pt-1 select-none space-x-1 font-semibold border-b">
        <div
          className={
            'flex justify-center items-center rounded-t-lg w-full h-10 border border-slate-300 transition-all ' +
            (selectedHomeTab == 'LAYER'
              ? ' bg-white border-b-0 text-lg'
              : ' cursor-pointer bg-slate-200 border-b-slate-300 hover:bg-gray-50 text-gray-500 hover:text-black')
          }
          onClick={() => {
            handleStoreUnsavedGeoPoint(geoPoints);
            handleTabSwitch('LAYER');
          }}
        >
          Layer
          <span className="ml-2">
            <FaLayerGroup />
          </span>
        </div>

        <div
          className={
            'flex justify-center items-center rounded-t-lg w-full h-10 border border-slate-300 transition-all ' +
            (selectedHomeTab == 'CATALOG'
              ? ' bg-white border-b-0 text-lg'
              : ' cursor-pointer bg-slate-200 border-b-slate-300  hover:bg-gray-50 text-gray-500 hover:text-black')
          }
          onClick={() => {
            handleTabSwitch('CATALOG');
          }}
        >
          Catalog
          <span className="ml-2">
            <FaBoxOpen />
          </span>
        </div>
      </div>

      {/* Container */}
      <div className="flex-1 flex flex-col  border-slate-300 lg:border border-t-0 bg-white overflow-hidden">
        {selectedHomeTab === 'LAYER' && <LayerFormLoader />}
        {selectedHomeTab === 'CATALOG' && <CatalogFormLoader />}
      </div>
    </div>
  );
}

function HomerDrawer() {
  const snapPoints = [0, 0.25, 0.5, 1];
  const [snap, setSnap] = useState<number>(snapPoints[1]);
  const { createLayerformStage } = useLayerContext();
  const { isDrawerOpen, isModalOpen, setIsDrawerOpen } = useUIContext();

  useEffect(() => {
    if (!isDrawerOpen) {
      document.body.style.pointerEvents = 'auto';
    }

    return () => {
      document.body.style.pointerEvents = 'auto';
    };
  }, [isDrawerOpen]);

  const handleOpenChange = (isOpen: boolean) => {
    console.log('Drawer open state changed:', isOpen);
    setIsDrawerOpen(isOpen);
    if (isOpen) {
      document.body.style.pointerEvents = 'auto';
    }
  };

  useEffect(() => {
    if (createLayerformStage === 'secondStep') {
      console.log('test');
      setSnap(snapPoints[2]);
    } else {
      setSnap(snapPoints[1]);
    }
  }, [createLayerformStage]);

  return (
    <>
      <BottomDrawer
        open={isDrawerOpen && !isModalOpen}
        onOpenChange={setIsDrawerOpen}
        modal={false}
        currentSnap={snap}
        snapPoints={snapPoints}
      >
        <HomeContent />
      </BottomDrawer>
    </>
  );
}

export default Home;
