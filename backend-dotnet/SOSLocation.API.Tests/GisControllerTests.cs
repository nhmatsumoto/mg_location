using Microsoft.AspNetCore.Mvc;
using Moq;
using SOSLocation.API.Controllers;
using SOSLocation.Domain.Interfaces;
using SOSLocation.Domain.Common;
using Xunit;

namespace SOSLocation.API.Tests
{
    public class GisControllerTests
    {
        private readonly Mock<IGisService> _gisServiceMock;
        private readonly Mock<IAlertsService> _alertsServiceMock;
        private readonly GisController _controller;

        public GisControllerTests()
        {
            _gisServiceMock = new Mock<IGisService>();
            _alertsServiceMock = new Mock<IAlertsService>();
            _controller = new GisController(_gisServiceMock.Object, _alertsServiceMock.Object);
        }

        [Fact]
        public async Task GetDigitalElevationModel_ReturnsOkWithData()
        {
            // Arrange
            var req = new DemRequest { MinLat = 0, MinLon = 0, MaxLat = 1, MaxLon = 1 };
            var mockGrid = new List<List<float>> { new List<float> { 10.0f } };
            _gisServiceMock.Setup(s => s.FetchElevationGridAsync(It.IsAny<double>(), It.IsAny<double>(), It.IsAny<double>(), It.IsAny<double>(), It.IsAny<int>()))
                .ReturnsAsync(mockGrid);

            // Act
            var result = await _controller.GetDigitalElevationModel(req);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            _gisServiceMock.Verify(s => s.FetchElevationGridAsync(req.MinLat, req.MinLon, req.MaxLat, req.MaxLon, req.Resolution), Times.Once);
        }

        [Fact]
        public void GetActiveAlerts_ReturnsOkWithAlerts()
        {
            // Arrange
            var mockAlerts = new List<ExternalAlert> { new ExternalAlert { Id = "1", Title = "Test Alert" } };
            _alertsServiceMock.Setup(s => s.GetActiveAlerts()).Returns(mockAlerts);

            // Act
            var result = _controller.GetActiveAlerts();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            _alertsServiceMock.Verify(s => s.GetActiveAlerts(), Times.Once);
        }
    }
}
