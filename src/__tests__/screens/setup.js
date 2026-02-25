/**
 * Setup file for snapshot tests only (loaded via jest.snapshot.config.js).
 *
 * FlatList and SectionList render deeply nested trees in the test environment,
 * causing pretty-format to exhaust the string-length limit. These lightweight
 * stand-ins keep snapshot output manageable.
 *
 * Important: jest.mock() factories cannot reference variables defined outside
 * them (Babel hoisting constraint). All references must be via require().
 */

jest.mock('react-native/Libraries/Lists/FlatList', () => {
  const React = require('react');

  function MockFlatList(props) {
    const { View } = require('react-native');
    const items = Array.isArray(props.data) ? props.data : [];
    return React.createElement(
      View,
      { testID: 'FlatList', style: props.contentContainerStyle },
      props.refreshControl || null,
      props.ListHeaderComponent || null,
      items.length === 0
        ? props.ListEmptyComponent || null
        : items.map(function (item, index) {
            const el = props.renderItem({ item, index });
            const key = props.keyExtractor
              ? props.keyExtractor(item, index)
              : String(index);
            return React.cloneElement(el, { key });
          })
    );
  }
  MockFlatList.displayName = 'FlatList';
  return { __esModule: true, default: MockFlatList };
});

jest.mock('react-native/Libraries/Lists/SectionList', () => {
  const React = require('react');

  function MockSectionList(props) {
    const { View } = require('react-native');
    const allSections = Array.isArray(props.sections) ? props.sections : [];
    if (allSections.length === 0) {
      return React.createElement(
        View,
        { testID: 'SectionList' },
        props.ListEmptyComponent || null
      );
    }
    return React.createElement(
      View,
      { testID: 'SectionList', style: props.contentContainerStyle },
      allSections.map(function (section, sIdx) {
        return React.createElement(
          View,
          { key: sIdx },
          props.renderSectionHeader ? props.renderSectionHeader({ section }) : null,
          (section.data || []).map(function (item, iIdx) {
            const el = props.renderItem({ item, index: iIdx, section });
            const key = props.keyExtractor
              ? props.keyExtractor(item, iIdx)
              : String(iIdx);
            return React.cloneElement(el, { key });
          })
        );
      })
    );
  }
  MockSectionList.displayName = 'SectionList';
  return { __esModule: true, default: MockSectionList };
});
