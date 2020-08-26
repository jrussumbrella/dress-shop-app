import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { SearchForm, SearchFilterModal } from './components';
import { useProducts } from '@/hooks';
import { ProductList, ProductListSkeleton, MySafeAreaView } from '@/components';
import { colors } from '@/theme';
import isReachedEnd from '@/utils/reachEnd';
import { AntDesign } from '@expo/vector-icons';
import { FilterData } from '@/types';

interface RouteParams {
  category?: string;
}

interface Payload extends FilterData {
  keyword?: string;
}

const SPINNER_SIZE = 35;

export const SearchScreen = () => {
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();

  let payload: Payload = {};

  const category = route.params?.category ? route.params.category : '';

  if (category) {
    payload.category = category;
  }

  const [searchText, setSearchText] = useState('');
  const [filterData, setFilterData] = useState<FilterData>(payload);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const {
    isLoadingMore,
    loading,
    loadMore,
    hasLoadMore,
    refreshing,
    refresh,
    products,
    loadProducts,
  } = useProducts(filterData);

  useFocusEffect(
    useCallback(() => {
      if (category) {
        const newFilterData = { ...filterData, category };
        setFilterData(newFilterData);
        loadProducts(newFilterData);
      }
    }, [category])
  );

  const handleSubmit = () => {
    loadProducts(payload);
  };

  const handleChangeText = (val: string) => {
    setSearchText(val);
  };

  const handleOnScroll = ({
    nativeEvent,
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isReachedEnd(nativeEvent) && !loading) {
      loadMore();
    }
  };

  const handleApplyFilter = (selectedData: FilterData) => {
    const newFilterData = {
      ...filterData,
      page: 1,
    };
    if (selectedData.category) {
      newFilterData.category = selectedData.category;
    }
    if (selectedData.sort) {
      newFilterData.sort = selectedData.sort;
    }

    setFilterData(newFilterData);
    loadProducts(newFilterData);
  };

  const handleResetFilter = () => {
    setFilterData({});
    loadProducts({ page: 1 });
  };

  const productList = loading ? (
    <ProductListSkeleton />
  ) : (
    <ProductList products={products} />
  );

  const searchEmptyText =
    !loading && products.length === 0 ? (
      <View style={styles.searchEmpty}>
        <Text style={styles.searchEmptyHeading}> No matching products.</Text>
        <Text style={styles.searchEmptySub}> Try a different search. </Text>
      </View>
    ) : null;

  const spinnerElement = isLoadingMore ? (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.primary} size={SPINNER_SIZE} />
    </View>
  ) : null;

  const reachedEndElement = !hasLoadMore ? (
    <View style={styles.msg}>
      <Text style={styles.msgText}> No more products to load.</Text>
    </View>
  ) : null;

  const filterModalElement = isOpenModal ? (
    <SearchFilterModal
      onDismissModal={() => setIsOpenModal(false)}
      onApply={handleApplyFilter}
      initialFilterData={filterData}
      onReset={handleResetFilter}
    />
  ) : null;

  return (
    <>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <MySafeAreaView>
          <View style={styles.container}>
            <View style={styles.topSearchContainer}>
              <SearchForm
                onSubmit={handleSubmit}
                value={searchText}
                onChangeText={handleChangeText}
              />
              <TouchableOpacity
                style={styles.filterIcon}
                onPress={() => setIsOpenModal(true)}
              >
                <AntDesign name="filter" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <ScrollView
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={refresh} />
              }
              onScroll={handleOnScroll}
            >
              <View style={styles.productContainer}>
                {searchEmptyText}
                {productList}
                {spinnerElement}
                {reachedEndElement}
              </View>
            </ScrollView>
          </View>
        </MySafeAreaView>
      </TouchableWithoutFeedback>
      {filterModalElement}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginVertical: 15,
  },
  filterIcon: {
    marginLeft: 5,
  },
  main: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 50,
  },
  msg: {
    padding: 10,
  },
  msgText: {
    fontSize: 15,
    textAlign: 'center',
    color: colors.primary,
  },
  productContainer: {
    padding: 15,
  },
  searchTotalContainer: {
    marginBottom: 10,
  },
  searchTotalText: {
    fontSize: 16,
  },
  searchEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchEmptyHeading: {
    fontWeight: '700',
  },
  searchEmptySub: {
    marginTop: 5,
  },
});
