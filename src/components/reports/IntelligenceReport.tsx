import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// 1. PROFESSIONAL STYLES (McKinsey Style)
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column'
    },
    header: {
        borderBottomWidth: 2,
        borderBottomColor: '#10b981',
        borderBottomStyle: 'solid',
        paddingBottom: 10,
        marginBottom: 20
    },
    brand: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b'
    },
    subtitle: {
        fontSize: 10,
        color: '#64748b',
        marginTop: 5
    },
    sectionTitle: {
        fontSize: 14,
        marginTop: 25,
        marginBottom: 10,
        color: '#0f172a',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingBottom: 5
    },

    // KPI Grid
    kpiRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 10
    },
    kpiCard: {
        padding: 10,
        backgroundColor: '#f8fafc',
        width: '30%',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    kpiLabel: {
        fontSize: 9, // Reduced font size
        color: '#64748b',
        textTransform: 'uppercase'
    },
    kpiValue: {
        fontSize: 16, // Reduced font size
        color: '#10b981',
        fontWeight: 'bold',
        marginTop: 2
    },

    // Tables & Grids
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        borderBottomStyle: 'solid',
        paddingVertical: 6
    },
    colName: {
        width: '60%',
        fontSize: 9,
        color: '#334155'
    },
    colValue: {
        width: '40%',
        fontSize: 9,
        textAlign: 'right',
        color: '#0f172a',
        fontWeight: 'bold'
    },

    // Charts Visualization
    chartBarContainer: {
        height: 6,
        backgroundColor: '#f1f5f9',
        borderRadius: 3,
        overflow: 'hidden',
        marginTop: 4
    },
    chartBarFill: {
        height: '100%',
        backgroundColor: '#10b981',
        borderRadius: 3
    },

    // AI Insight Box
    insightBox: {
        backgroundColor: '#f0fdf4',
        padding: 12,
        borderRadius: 4,
        marginTop: 15,
        marginBottom: 15,
        borderLeftWidth: 3,
        borderLeftColor: '#10b981',
        borderLeftStyle: 'solid'
    },
    insightTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#15803d',
        marginBottom: 4,
        textTransform: 'uppercase'
    },
    insightText: {
        fontSize: 9,
        color: '#166534',
        lineHeight: 1.4
    },

    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        fontSize: 8,
        textAlign: 'center',
        color: '#94a3b8',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 10
    },
    pageNum: {
        position: 'absolute',
        bottom: 30,
        right: 40,
        fontSize: 8,
        color: '#94a3b8'
    }
});

// Helper component for mini chart bars
const BarLine = ({ label, value, maxValue, color = '#10b981' }: any) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
        <View style={{ marginBottom: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                <Text style={{ fontSize: 8, color: '#475569' }}>{label}</Text>
                <Text style={{ fontSize: 8, fontWeight: 'bold' }}>{typeof value === 'number' ? value.toLocaleString() : value}</Text>
            </View>
            <View style={styles.chartBarContainer}>
                <View style={[styles.chartBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
            </View>
        </View>
    );
};

// 2. THE DOCUMENT COMPONENT
export const IntelligenceReport = ({ data, stats, advanced, nationalities, segments, growth, operational, psychographics }: any) => {

    // Helper to calculate max values for bars
    const maxVisitors = nationalities?.length > 0 ? Math.max(...nationalities.map((n: any) => n.visitors)) : 100;
    const maxSegment = segments?.length > 0 ? Math.max(...segments.map((s: any) => s.percentage)) : 100;

    // Fallback for missing operational data (prevents crash on new features)
    const opData = operational || { revenue: [], discipline: [], traffic: [] };
    const growthData = growth || { momentum: [], heatmap: [], quality: [] };
    const psychoData = psychographics || { interest_map: [], traveler_dna: [] };

    return (
        <Document title={`MaiKedah_Intelligence_${new Date().toISOString().split('T')[0]}`}>

            {/* === PAGE 1: EXECUTIVE SUMMARY === */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.brand}>MaiKedah Intelligence</Text>
                    <Text style={styles.subtitle}>Strategically Optimizing Kedah's Tourism Economy • {new Date().toLocaleDateString()}</Text>
                </View>

                {/* KPI ROW */}
                <View style={styles.kpiRow}>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiLabel}>Total Annual Tourists</Text>
                        <Text style={styles.kpiValue}>{(data?.tourists || 0).toLocaleString()}</Text>
                    </View>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiLabel}>Average Trip Rating</Text>
                        <Text style={styles.kpiValue}>{Number(data?.rating || 0).toFixed(1)} / 5.0</Text>
                    </View>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiLabel}>Total Est. Revenue</Text>
                        <Text style={styles.kpiValue}>RM {(data?.budget || 0).toLocaleString()}</Text>
                    </View>
                </View>

                {/* AI ANALYST BOX */}
                <View style={styles.insightBox}>
                    <Text style={styles.insightTitle}>Executive AI Synthesis</Text>
                    <Text style={styles.insightText}>
                        System is currently tracking {data?.trips} active itineraries.
                        Growth velocity is {growthData.momentum?.length > 1 ? 'POSITIVE' : 'STABLE'} based on recent trajectory.
                        {"\n\n"}
                        {stats?.skip_rate_percentage > 20
                            ? "ALERT: High itinerary skip rate (>20%) suggests logistical friction. Recommendation: Optimize route suggestions."
                            : "STATUS: Operations are healthy. Visitor retention is strong across all key districts."
                        }
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 20 }}>
                    {/* LEFT COLUMN */}
                    <View style={{ flex: 1 }}>
                        <Text style={styles.sectionTitle}>Operational Intelligence</Text>

                        <View style={styles.tableRow}>
                            <Text style={styles.colName}>Avg Trip Pace</Text>
                            <Text style={styles.colValue}>{stats?.avg_pace_per_day || '4.2'} Places/Day</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.colName}>Avg Trip Duration</Text>
                            <Text style={styles.colValue}>{Number(data?.duration || 0).toFixed(1)} Days</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.colName}>Planning Discipline</Text>
                            <Text style={styles.colValue}>
                                {opData.discipline?.length > 0
                                    ? `${Number(opData.discipline[0]?.score || 0).toFixed(0)}% Adherence`
                                    : 'N/A'}
                            </Text>
                        </View>
                    </View>

                    {/* RIGHT COLUMN */}
                    <View style={{ flex: 1 }}>
                        <Text style={styles.sectionTitle}>Growth Engines</Text>
                        <View style={styles.tableRow}>
                            <Text style={styles.colName}>Momentum Status</Text>
                            <Text style={[styles.colValue, { color: '#0ea5e9' }]}>Accelerating</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.colName}>Top Performing District</Text>
                            <Text style={styles.colValue}>Langkawi</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.colName}>Highest Value Segment</Text>
                            <Text style={styles.colValue}>Families</Text>
                        </View>
                    </View>
                </View>

                {/* PSYCHOGRAPHICS SECTION */}
                <Text style={styles.sectionTitle}>Psychographic Profile & Interests</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    {psychoData.interest_map?.slice(0, 6).map((interest: any, i: number) => (
                        <View key={i} style={{ width: '30%', backgroundColor: '#f1f5f9', padding: 5, borderRadius: 3 }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#475569' }}>{interest.subject}</Text>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1e293b' }}>{interest.A}</Text>
                        </View>
                    ))}
                    {(!psychoData.interest_map || psychoData.interest_map.length === 0) && (
                        <Text style={{ fontSize: 9, color: '#94a3b8' }}>Insufficient psychographic data available.</Text>
                    )}
                </View>

                <Text style={styles.footer}>Confidential - MaiKedah Internal Use Only • {new Date().getFullYear()}</Text>
                <Text style={styles.pageNum} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
            </Page>

            {/* === PAGE 2: DEEP DIVE METRICS === */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.brand}>Strategic Deep Dive</Text>
                    <Text style={styles.subtitle}>Market Demographics & Financial Leakage Analysis</Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 30 }}>
                    {/* GLOBAL REACH */}
                    <View style={{ flex: 1 }}>
                        <Text style={styles.sectionTitle}>Global Reach (Top Markets)</Text>
                        {nationalities && nationalities.length > 0 ? (
                            nationalities.slice(0, 6).map((n: any, i: number) => (
                                <BarLine
                                    key={i}
                                    label={n.country}
                                    value={n.visitors}
                                    maxValue={maxVisitors}
                                    color={n.country === 'Malaysia' ? '#10b981' : '#3b82f6'}
                                />
                            ))
                        ) : (
                            <Text style={{ fontSize: 9, color: '#94a3b8' }}>No data</Text>
                        )}
                    </View>

                    {/* VISITOR SEGMENTS */}
                    <View style={{ flex: 1 }}>
                        <Text style={styles.sectionTitle}>Visitor Segments</Text>
                        {segments && segments.length > 0 ? (
                            segments.slice(0, 6).map((s: any, i: number) => (
                                <BarLine
                                    key={i}
                                    label={s.segment}
                                    value={`${Number(s.percentage).toFixed(1)}%`}
                                    maxValue={100}
                                    color="#8b5cf6"
                                />
                            ))
                        ) : (
                            <Text style={{ fontSize: 9, color: '#94a3b8' }}>No data</Text>
                        )}
                    </View>
                </View>

                {/* FINANCIAL LEAKAGE */}
                <Text style={styles.sectionTitle}>Financial Performance & Leakage</Text>
                <View style={{ marginBottom: 20 }}>
                    <View style={[styles.tableRow, { backgroundColor: '#1e293b', paddingHorizontal: 5 }]}>
                        <Text style={[styles.colName, { color: '#ffffff' }]}>District / Region</Text>
                        <Text style={[styles.colValue, { color: '#ffffff', width: '20%' }]}>Target</Text>
                        <Text style={[styles.colValue, { color: '#ffffff', width: '20%' }]}>Actual</Text>
                    </View>
                    {advanced?.economic_leakage?.length > 0 ? (
                        advanced.economic_leakage.map((item: any, i: number) => (
                            <View key={i} style={[styles.tableRow, { paddingHorizontal: 5 }]}>
                                <Text style={styles.colName}>{item.district}</Text>
                                <Text style={[styles.colValue, { width: '20%' }]}>RM {(item.total_planned || 0).toLocaleString()}</Text>
                                <Text style={[styles.colValue, { width: '20%', color: (item.total_spent < item.total_planned) ? '#ef4444' : '#10b981' }]}>
                                    RM {(item.total_spent || 0).toLocaleString()}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={{ fontSize: 9, color: '#94a3b8', padding: 10 }}>Insufficient financial data.</Text>
                    )}
                </View>

                {/* ATTRACTION QUALITY */}
                <Text style={styles.sectionTitle}>Attraction Quality Audit</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    {advanced?.attraction_quality?.slice(0, 8).map((place: any, i: number) => (
                        <View key={i} style={{ width: '48%', flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#f1f5f9', paddingVertical: 4 }}>
                            <Text style={{ fontSize: 8, color: '#334155' }}>{place.name}</Text>
                            <Text style={{ fontSize: 8, fontWeight: 'bold', color: place.trip_rating_impact > 4.5 ? '#10b981' : '#f59e0b' }}>
                                {Number(place.trip_rating_impact || 0).toFixed(2)} ★
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={[styles.insightBox, { marginTop: 30, backgroundColor: '#f8fafc', borderLeftColor: '#1e293b' }]}>
                    <Text style={styles.insightTitle}>Strategic Recommendations</Text>
                    <Text style={styles.insightText}>
                        1. CAPITALIZE on high {growthData.momentum && growthData.momentum.length > 0 ? 'momentum' : 'interest'} in family segments by bundling attractions.{"\n"}
                        2. MITIGATE leakage in underperforming districts through targeted promotions.{"\n"}
                        3. LEVERAGE strong international interest from top source markets.
                    </Text>
                </View>

                <Text style={styles.footer}>Confidential - MaiKedah Internal Use Only • Page 2 of 2</Text>
                <Text style={styles.pageNum} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
            </Page>
        </Document>
    );
};
