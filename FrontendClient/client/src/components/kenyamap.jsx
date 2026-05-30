import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import * as d3 from 'd3';
import * as d3Geo from 'd3-geo';
import { scaleSequential } from 'd3-scale';
import { interpolateGnBu } from 'd3-scale-chromatic';
import kenyaCounties from '../../../public/kenyan-counties.json';

const KenyaMap = ({ countyData }) => {
  const [tooltip, setTooltip] = useState({ visible: false, content: '', x: 0, y: 0 });
  const svgRef = useRef(null);

  const deathsMap = new Map(
    countyData.map(d => [d.name.toLowerCase(), d.deaths])
  );

  const maxDeaths = Math.max(...countyData.map(d => d.deaths), 1);

  const colorScale = scaleSequential()
    .domain([0, maxDeaths])
    .interpolator(interpolateGnBu);

  const projection = d3Geo.geoMercator().fitSize([800, 800], kenyaCounties);
  const pathGenerator = d3Geo.geoPath().projection(projection);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.call(
      d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', (event) => {
          svg.select('g').attr('transform', event.transform);
        })
    );
  }, []);

  const handleMouseEnter = (event, countyName, deaths) => {
    event.target.style.stroke = '#2c3e50';
    event.target.style.strokeWidth = '1.5';
    setTooltip({
      visible: true,
      content: `${countyName}: ${deaths} deaths`,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleMouseLeave = (event) => {
    event.target.style.stroke = '#c0c0c0';
    event.target.style.strokeWidth = '0.5';
    setTooltip({ ...tooltip, visible: false });
  };

  const handleMouseMove = (event) => {
    if (tooltip.visible) {
      setTooltip({
        ...tooltip,
        x: event.clientX,
        y: event.clientY,
      });
    }
  };

  const handleCountyClick = (countyName) => {
    alert(`You clicked on ${countyName}`);
  };

  if (!countyData || countyData.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography variant="h6">Loading Kenya Map...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: '400px', sm: '600px', md: '800px' },
        padding: 2,
        borderRadius: '12px',
        background: '#f8f9fa',
        boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}
      onMouseMove={handleMouseMove}
    >
      <Box
        component="svg"
        ref={svgRef}
        viewBox="0 0 800 800"
        width="100%"
        height="100%"
      >
        <title>Kenya Counties Death Map</title>
        <desc>Choropleth map showing death statistics per county in Kenya</desc>
        <g>
          {kenyaCounties.features.map((feature, i) => {
            const nameProp = feature.properties.name || feature.properties.NAME || feature.properties.COUNTY || feature.properties.COUNTY_NAM;
            const countyName = nameProp ? nameProp.trim().toLowerCase() : '';
            const deaths = deathsMap.get(countyName) || 0;
            const fillColor = deaths === 0 ? '#e0e0e0' : colorScale(deaths);

            return (
              <path
                key={i}
                d={pathGenerator(feature)}
                fill={fillColor}
                stroke="#c0c0c0"
                strokeWidth="0.5"
                style={{ transition: 'all 0.2s ease-in-out', cursor: 'pointer' }}
                onMouseEnter={(e) => handleMouseEnter(e, nameProp, deaths)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleCountyClick(nameProp)}
              />
            );
          })}
        </g>
      </Box>

      {/* Tooltip */}
      {tooltip.visible && (
        <Paper
          sx={{
            position: 'fixed',
            top: tooltip.y + 10,
            left: tooltip.x + 10,
            padding: '10px 15px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '6px',
            pointerEvents: 'none',
            zIndex: 1000,
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            minWidth: '150px',
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
            🏥 {tooltip.content}
          </Typography>
        </Paper>
      )}

      {/* Legend */}
      <Box sx={{
        position: 'absolute',
        bottom: '24px',
        right: '24px',
        p: 2,
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        minWidth: '180px'
      }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>Deaths per County</Typography>
        <Box sx={{
          width: '100%',
          height: '20px',
          background: `linear-gradient(to right, ${colorScale(0)}, ${colorScale(maxDeaths)})`
        }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography variant="caption">0</Typography>
          <Typography variant="caption">{maxDeaths}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default KenyaMap;
