cmake_minimum_required(VERSION 3.10)
project(CarbonFootprintAnalyzer VERSION 1.1 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Option to enable HTTPS client support (for calling OpenAI)
option(ENABLE_SSL "Enable OpenSSL support for HTTPS (required to call OpenAI securely)" ON)

include_directories(${PROJECT_SOURCE_DIR}/include)

file(GLOB SOURCES ${PROJECT_SOURCE_DIR}/src/*.cpp)

add_executable(CarbonFootprintAnalyzer ${SOURCES})

# Warnings
if(MSVC)
  target_compile_options(CarbonFootprintAnalyzer PRIVATE /W4)
else()
  target_compile_options(CarbonFootprintAnalyzer PRIVATE -Wall -Wextra -Wpedantic)
endif()

# On Windows, link Winsock and Crypt32 (needed by cpp-httplib + OpenSSL)
if(WIN32)
  target_link_libraries(CarbonFootprintAnalyzer PRIVATE ws2_32 crypt32)
endif()

# If SSL requested, try to find OpenSSL and enable cpp-httplib SSL define
if(ENABLE_SSL)
  find_package(OpenSSL REQUIRED)
  if(OpenSSL_FOUND)
    target_compile_definitions(CarbonFootprintAnalyzer PRIVATE CPPHTTPLIB_OPENSSL_SUPPORT)
    target_link_libraries(CarbonFootprintAnalyzer PRIVATE OpenSSL::SSL OpenSSL::Crypto)
  else()
    message(FATAL_ERROR "ENABLE_SSL requested but OpenSSL not found")
  endif()
endif()
