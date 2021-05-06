import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Product } from '@/types';
import ProductItem from './ProductItem';

interface Props {
  products: Product[];
  routeName: string;
}

const ProductList: React.FC<Props> = ({ products, routeName }) => {
  return (
    <View style={styles.products}>
      {products.map((product) => (
        <ProductItem
          routeName={routeName}
          product={product}
          key={product._id}
        />
      ))}
    </View>
  );
};

export default ProductList;

const styles = StyleSheet.create({
  products: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});