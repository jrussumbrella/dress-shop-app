import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Category } from '@/types';
import { CategoryService } from '@/services';
import HomeCategoriesSkeleton from './HomeCategoriesSkeleton';
import navigationNames from '@/navigation/navigationNames';

export const HomeCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const results = await CategoryService.getCategories();
        setCategories(results.categories);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (isLoading || error) {
    return <HomeCategoriesSkeleton />;
  }

  return (
    <View style={styles.container}>
      {categories.map((category) => (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate(navigationNames.searchTab, {
              screen: navigationNames.searchScreen,
              params: { category: category.name.toLowerCase() },
            })
          }
          key={category._id}
        >
          <View style={styles.list}>
            <Text style={styles.text}>{category.name}</Text>
            <Image
              style={styles.listImg}
              source={{
                uri: category.imageURL,
              }}
            />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    paddingHorizontal: 15,
  },
  listImg: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  list: {
    borderWidth: 0.5,
    borderColor: '#eee',
    marginBottom: 15,
    position: 'relative',
  },
  text: {
    position: 'absolute',
    zIndex: 10,
    top: 20,
    left: 20,
    fontSize: 16,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
});
