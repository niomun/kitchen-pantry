import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePantryStore } from '../store/usePantryStore';
import { globalStyles } from '../styles/globalStyles';
import { theme } from '../styles/theme';

const locations = [
  { id: 'fridge', label: 'Холодильник' },
  { id: 'freezer', label: 'Морозильник' },
  { id: 'drinks', label: 'Напої' },
  { id: 'bakery', label: 'Випічка' },
  { id: 'grains', label: 'Крупи' },
  { id: 'other', label: 'Інше' },
];

export default function AddProductScreen() {
  const router = useRouter();
  const addProduct = usePantryStore((state) => state.addProduct);
  const [name, setName] = useState('');
  const [locationId, setLocationId] = useState('fridge');
  const [isEssential, setIsEssential] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [shelfAmount, setShelfAmount] = useState('0');
  const [minAmount, setMinAmount] = useState('1');
  const [stockAmount, setStockAmount] = useState('0');
  const [unit, setUnit] = useState('г');
  const [stride, setStride] = useState('1');
  const [packCapacity, setPackCapacity] = useState('1');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const trimmedName = name.trim();
    const parsedShelfAmount = Number(shelfAmount);
    const parsedMinAmount = Number(minAmount);
    const parsedStride = Number(stride);
    const parsedStockAmount = Number(stockAmount);
    const parsedPackCapacity = Number(packCapacity);

    if (!trimmedName || !unit.trim()) {
      setError('Вкажіть назву товару та одиницю виміру.');
      return;
    }

    if (
      !Number.isInteger(parsedShelfAmount) || parsedShelfAmount < 0 ||
      !Number.isInteger(parsedStride) || parsedStride < 1 ||
      (isEssential && (
        !Number.isInteger(parsedStockAmount) || parsedStockAmount < 0 ||
        !Number.isInteger(parsedMinAmount) || parsedMinAmount < 0 ||
        !Number.isInteger(parsedPackCapacity) || parsedPackCapacity < 1
      ))
    ) {
      setError('Перевірте кількість: значення мають бути цілими та невід’ємними.');
      return;
    }

    setError('');
    setIsSaving(true);
    try {
      await addProduct({
        name: trimmedName,
        locationId,
        isEssential,
        isUrgent,
        shelfAmount: parsedShelfAmount,
        minAmount: isEssential ? parsedMinAmount : 0,
        unit: unit.trim(),
        stride: parsedStride,
        stockAmount: isEssential ? parsedStockAmount : null,
        packCapacity: isEssential ? parsedPackCapacity : null,
      });
      router.back();
    } catch (saveError) {
      console.error('Не вдалося зберегти товар:', saveError);
      setError('Не вдалося зберегти товар. Спробуйте ще раз.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderNumberInput = (
    label: string,
    value: string,
    onChangeText: (value: string) => void,
  ) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        style={styles.input}
        value={value}
        onChangeText={(nextValue) => onChangeText(nextValue.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
        selectTextOnFocus
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[globalStyles.screenContainer, styles.screen]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={globalStyles.headerRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Назад"
          style={globalStyles.backButton}
          onPress={() => router.back()}
        >
          <Text style={globalStyles.buttonText}>{'<'}</Text>
        </Pressable>
        <Text style={[globalStyles.screenTitle, styles.title]}>Новий товар</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.field}>
          <Text style={styles.label}>Назва</Text>
          <TextInput
            accessibilityLabel="Назва товару"
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Наприклад, гречка"
            placeholderTextColor={theme.colors.textMuted}
            returnKeyType="next"
            maxLength={60}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Місце зберігання</Text>
          <View style={styles.options}>
            {locations.map((location) => {
              const selected = locationId === location.id;
              return (
                <Pressable
                  key={location.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => setLocationId(location.id)}
                >
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                    {location.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchCopy}>
            <Text style={styles.label}>Основний товар</Text>
            <Text style={styles.helper}>Відстежувати нерозпаковані упаковки</Text>
          </View>
          <Switch
            accessibilityLabel="Основний товар"
            value={isEssential}
            onValueChange={setIsEssential}
            trackColor={{ false: '#C9C1B7', true: theme.colors.mintDark }}
            thumbColor={theme.colors.bgCardMain}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchCopy}>
            <Text style={styles.label}>Терміново купити</Text>
            <Text style={styles.helper}>Позначити в списку покупок</Text>
          </View>
          <Switch
            accessibilityLabel="Терміново купити"
            value={isUrgent}
            onValueChange={setIsUrgent}
            trackColor={{ false: '#C9C1B7', true: theme.colors.urgent }}
            thumbColor={theme.colors.bgCardMain}
          />
        </View>

        {renderNumberInput('На полиці', shelfAmount, setShelfAmount)}
        <View style={styles.numberRow}>
          {renderNumberInput('Порція', stride, setStride)}
          <View style={[styles.field, styles.unitField]}>
            <Text style={styles.label}>Одиниця</Text>
            <TextInput
              accessibilityLabel="Одиниця виміру"
              style={styles.input}
              value={unit}
              onChangeText={setUnit}
              placeholder="г"
              placeholderTextColor={theme.colors.textMuted}
              maxLength={12}
            />
          </View>
        </View>

        {isEssential && (
          <View style={styles.essentialFields}>
            <View style={styles.numberRow}>
              {renderNumberInput('Запас упаковок', stockAmount, setStockAmount)}
              {renderNumberInput('Мінімум упаковок', minAmount, setMinAmount)}
            </View>
            {renderNumberInput('Місткість упаковки', packCapacity, setPackCapacity)}
          </View>
        )}

        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

        <Pressable
          accessibilityRole="button"
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>{isSaving ? 'Зберігаємо…' : 'Додати товар'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: theme.colors.bgMain,
  },
  title: {
    color: theme.colors.textBrown,
  },
  form: {
    paddingBottom: 36,
    gap: 20,
  },
  field: {
    flex: 1,
    gap: 8,
  },
  label: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: theme.colors.textBrown,
  },
  helper: {
    marginTop: 4,
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  input: {
    minHeight: 48,
    borderWidth: 2,
    borderColor: theme.colors.borderMain,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.bgCardMain,
    color: theme.colors.textBrown,
    fontFamily: theme.fonts.regular,
    fontSize: 16,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: theme.colors.borderMain,
    borderRadius: 10,
    backgroundColor: theme.colors.bgCardMain,
  },
  optionSelected: {
    backgroundColor: theme.colors.mint,
    borderColor: theme.colors.mintDark,
  },
  optionText: {
    fontFamily: theme.fonts.medium,
    color: theme.colors.textBrown,
  },
  optionTextSelected: {
    fontFamily: theme.fonts.bold,
  },
  switchRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 4,
  },
  switchCopy: {
    flex: 1,
  },
  numberRow: {
    flexDirection: 'row',
    gap: 12,
  },
  unitField: {
    flex: 0.8,
  },
  essentialFields: {
    gap: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderColor: '#E8DCC4',
  },
  error: {
    fontFamily: theme.fonts.medium,
    color: theme.colors.urgent,
  },
  saveButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    borderWidth: 3,
    borderColor: theme.colors.mintDark,
    borderRadius: 12,
    backgroundColor: theme.colors.mint,
    shadowColor: theme.colors.shadowMain,
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.65,
  },
  saveButtonText: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: theme.colors.textGreen,
  },
});